import { prisma } from "@/lib/prisma";
import type { ListParams } from "@/lib/admin/query";
import type {
  AdminCategoryDetail,
  AdminCategoryTreeNode,
  CategoryTreeFilters,
} from "@/types/admin-category";
import type { Gender, Prisma } from "@/generated/prisma/client";

const activeProduct = { deletedAt: null };

function matchesQuery(
  name: string,
  slug: string,
  q: string | undefined,
): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    name.toLowerCase().includes(lower) || slug.toLowerCase().includes(lower)
  );
}

export async function listCategoryTree(
  filters: CategoryTreeFilters = {},
): Promise<AdminCategoryTreeNode[]> {
  const categories = await prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    include: {
      subcategories: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: {
            select: { products: { where: activeProduct } },
          },
        },
      },
      _count: {
        select: { subcategories: { where: { deletedAt: null } } },
      },
    },
  });

  const productCountsByCategory = await prisma.product.groupBy({
    by: ["subcategoryId"],
    where: { ...activeProduct },
    _count: { id: true },
  });
  const countBySubId = new Map(
    productCountsByCategory.map((r) => [r.subcategoryId, r._count.id]),
  );

  const nodes: AdminCategoryTreeNode[] = [];

  for (const cat of categories) {
    const children = cat.subcategories
      .filter((sub) => matchesQuery(sub.name, sub.slug, filters.q))
      .map((sub) => {
        const productCount = countBySubId.get(sub.id) ?? 0;
        return {
          id: sub.id,
          type: "subcategory" as const,
          categoryId: cat.id,
          name: sub.name,
          slug: sub.slug,
          sortOrder: sub.sortOrder,
          isActive: sub.isActive,
          image: sub.image,
          bannerImage: sub.bannerImage,
          productCount,
          isEmpty: productCount === 0,
        };
      });

    const productCount = children.reduce((sum, c) => sum + c.productCount, 0);
    const catMatches = matchesQuery(cat.name, cat.slug, filters.q);
    const childMatches = children.length > 0;

    if (filters.q && !catMatches && !childMatches) continue;

    if (filters.status === "active" && !cat.isActive) continue;
    if (filters.status === "inactive" && cat.isActive) continue;

    if (filters.empty === "empty" && productCount > 0) continue;
    if (filters.empty === "with_products" && productCount === 0) continue;

    const visibleChildren =
      filters.status === "active"
        ? children.filter((c) => c.isActive)
        : filters.status === "inactive"
          ? children.filter((c) => !c.isActive)
          : children;

    if (filters.empty === "empty") {
      const onlyEmptyChildren = visibleChildren.filter((c) => c.isEmpty);
      if (!catMatches && onlyEmptyChildren.length === 0) continue;
    }

    nodes.push({
      id: cat.id,
      type: "category",
      name: cat.name,
      slug: cat.slug,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      image: cat.image,
      bannerImage: cat.bannerImage,
      gender: cat.gender,
      productCount,
      subcategoryCount: cat._count.subcategories,
      isEmpty: productCount === 0 && cat._count.subcategories === 0,
      children:
        filters.q && !catMatches
          ? visibleChildren
          : filters.empty === "empty"
            ? visibleChildren.filter((c) => c.isEmpty)
            : filters.empty === "with_products"
              ? visibleChildren.filter((c) => !c.isEmpty)
              : visibleChildren,
    });
  }

  return nodes;
}

export async function listAdminCategoriesFlat(params: ListParams) {
  const where: Prisma.CategoryWhereInput = {
    deletedAt: null,
    ...(params.q && {
      OR: [
        { name: { contains: params.q, mode: "insensitive" } },
        { slug: { contains: params.q, mode: "insensitive" } },
        {
          subcategories: {
            some: {
              deletedAt: null,
              OR: [
                { name: { contains: params.q, mode: "insensitive" } },
                { slug: { contains: params.q, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    }),
  };

  const categories = await prisma.category.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    include: {
      subcategories: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { products: { where: activeProduct } } },
        },
      },
      _count: { select: { subcategories: { where: { deletedAt: null } } } },
    },
  });

  type FlatRow = {
    id: string;
    type: "category" | "subcategory";
    parentName: string | null;
    parentId: string | null;
    name: string;
    slug: string;
    sortOrder: number;
    isActive: boolean;
    productCount: number;
    subcategoryCount: number;
    isEmpty: boolean;
  };

  const rows: FlatRow[] = [];
  for (const cat of categories) {
    const catProductCount = cat.subcategories.reduce(
      (s, sub) => s + sub._count.products,
      0,
    );
    rows.push({
      id: cat.id,
      type: "category",
      parentName: null,
      parentId: null,
      name: cat.name,
      slug: cat.slug,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      productCount: catProductCount,
      subcategoryCount: cat._count.subcategories,
      isEmpty: catProductCount === 0,
    });
    for (const sub of cat.subcategories) {
      rows.push({
        id: sub.id,
        type: "subcategory",
        parentName: cat.name,
        parentId: cat.id,
        name: sub.name,
        slug: sub.slug,
        sortOrder: sub.sortOrder,
        isActive: sub.isActive,
        productCount: sub._count.products,
        subcategoryCount: 0,
        isEmpty: sub._count.products === 0,
      });
    }
  }

  const start = (params.page - 1) * params.perPage;
  const paged = rows.slice(start, start + params.perPage);
  return { items: paged, total: rows.length };
}

/** @deprecated Use listCategoryTree — kept for compatibility */
export async function listAdminCategories(params: ListParams) {
  const where: Prisma.CategoryWhereInput = {
    deletedAt: null,
    ...(params.q && {
      OR: [
        { name: { contains: params.q, mode: "insensitive" } },
        { slug: { contains: params.q, mode: "insensitive" } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      skip: (params.page - 1) * params.perPage,
      take: params.perPage,
      include: {
        _count: {
          select: { subcategories: { where: { deletedAt: null } } },
        },
      },
    }),
    prisma.category.count({ where }),
  ]);

  return { items, total };
}

export async function getCategoryDetail(
  id: string,
  type: "category" | "subcategory",
): Promise<AdminCategoryDetail | null> {
  if (type === "category") {
    const cat = await prisma.category.findFirst({
      where: { id, deletedAt: null },
      include: {
        subcategories: {
          where: { deletedAt: null },
          include: { _count: { select: { products: { where: activeProduct } } } },
        },
      },
    });
    if (!cat) return null;
    const productCount = cat.subcategories.reduce(
      (s, sub) => s + sub._count.products,
      0,
    );
    return {
      id: cat.id,
      type: "category",
      categoryId: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      shortDescription: cat.shortDescription,
      metaTitle: cat.metaTitle,
      metaDescription: cat.metaDescription,
      image: cat.image,
      bannerImage: cat.bannerImage,
      gender: cat.gender,
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      productCount,
      subcategoryCount: cat.subcategories.length,
    };
  }

  const sub = await prisma.subcategory.findFirst({
    where: { id, deletedAt: null },
    include: {
      _count: { select: { products: { where: activeProduct } } },
    },
  });
  if (!sub) return null;
  return {
    id: sub.id,
    type: "subcategory",
    categoryId: sub.categoryId,
    name: sub.name,
    slug: sub.slug,
    description: sub.description,
    shortDescription: sub.shortDescription,
    metaTitle: sub.metaTitle,
    metaDescription: sub.metaDescription,
    image: sub.image,
    bannerImage: sub.bannerImage,
    gender: null,
    sortOrder: sub.sortOrder,
    isActive: sub.isActive,
    productCount: sub._count.products,
    subcategoryCount: 0,
  };
}

export async function isSlugAvailable(
  slug: string,
  opts: { type: "category" | "subcategory"; excludeId?: string },
): Promise<boolean> {
  const [cat, sub] = await Promise.all([
    prisma.category.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(opts.type === "category" && opts.excludeId
          ? { NOT: { id: opts.excludeId } }
          : {}),
      },
      select: { id: true },
    }),
    prisma.subcategory.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(opts.type === "subcategory" && opts.excludeId
          ? { NOT: { id: opts.excludeId } }
          : {}),
      },
      select: { id: true },
    }),
  ]);

  if (opts.type === "category") {
    return !cat && !sub;
  }
  return !sub && !cat;
}

export async function getAdminCategoryById(id: string) {
  return prisma.category.findFirst({
    where: { id, deletedAt: null },
    include: {
      subcategories: {
        where: { deletedAt: null },
        orderBy: { sortOrder: "asc" },
        include: {
          _count: { select: { products: { where: { deletedAt: null } } } },
        },
      },
    },
  });
}

type CategoryWriteData = {
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  image?: string | null;
  bannerImage?: string | null;
  gender?: Gender | null;
  sortOrder: number;
  isActive: boolean;
};

type SubcategoryWriteData = {
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  image?: string | null;
  bannerImage?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export async function createCategoryRecord(data: CategoryWriteData) {
  return prisma.category.create({ data });
}

export async function updateCategoryRecord(
  categoryId: string,
  data: Partial<CategoryWriteData>,
) {
  return prisma.category.update({ where: { id: categoryId }, data });
}

export async function deactivateCategoryChildren(categoryId: string) {
  return prisma.subcategory.updateMany({
    where: { categoryId, deletedAt: null },
    data: { isActive: false },
  });
}

export async function softDeleteCategory(categoryId: string) {
  const productCount = await prisma.product.count({
    where: {
      deletedAt: null,
      subcategory: { categoryId },
    },
  });
  return { productCount };
}

export async function softDeleteCategoryWithSubs(categoryId: string) {
  return prisma.$transaction(async (tx) => {
    await tx.subcategory.updateMany({
      where: { categoryId },
      data: { deletedAt: new Date() },
    });
    return tx.category.update({
      where: { id: categoryId },
      data: { deletedAt: new Date(), isActive: false },
    });
  });
}

export async function createSubcategoryRecord(
  data: SubcategoryWriteData & { categoryId: string },
) {
  return prisma.subcategory.create({ data });
}

export async function updateSubcategoryRecord(
  subcategoryId: string,
  data: Partial<SubcategoryWriteData>,
) {
  return prisma.subcategory.update({ where: { id: subcategoryId }, data });
}

export async function softDeleteSubcategory(subcategoryId: string) {
  return prisma.product.count({
    where: { subcategoryId, deletedAt: null },
  });
}

export async function markSubcategoryDeleted(subcategoryId: string) {
  return prisma.subcategory.update({
    where: { id: subcategoryId },
    data: { deletedAt: new Date() },
  });
}

export async function reorderCategoryNodes(
  items: { id: string; type: "category" | "subcategory"; sortOrder: number }[],
) {
  const categoryUpdates = items.filter((i) => i.type === "category");
  const subUpdates = items.filter((i) => i.type === "subcategory");

  if (categoryUpdates.length === 0 && subUpdates.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const item of categoryUpdates) {
      await tx.category.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      });
    }
    for (const item of subUpdates) {
      await tx.subcategory.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      });
    }
  });
}

export async function bulkSetActive(
  items: { id: string; type: "category" | "subcategory" }[],
  isActive: boolean,
  cascadeChildren: boolean,
) {
  const categoryIds = items.filter((i) => i.type === "category").map((i) => i.id);
  const subIds = items.filter((i) => i.type === "subcategory").map((i) => i.id);

  const hasWork =
    categoryIds.length > 0 ||
    subIds.length > 0 ||
    (cascadeChildren && !isActive && categoryIds.length > 0);
  if (!hasWork) return;

  await prisma.$transaction(async (tx) => {
    if (categoryIds.length > 0) {
      await tx.category.updateMany({
        where: { id: { in: categoryIds } },
        data: { isActive },
      });
    }
    if (subIds.length > 0) {
      await tx.subcategory.updateMany({
        where: { id: { in: subIds } },
        data: { isActive },
      });
    }
    if (cascadeChildren && !isActive && categoryIds.length > 0) {
      await tx.subcategory.updateMany({
        where: { categoryId: { in: categoryIds }, deletedAt: null },
        data: { isActive: false },
      });
    }
  });
}

export async function getCategorySeoBySlug(slug: string) {
  const sub = await prisma.subcategory.findFirst({
    where: { slug, deletedAt: null, isActive: true },
    select: {
      name: true,
      metaTitle: true,
      metaDescription: true,
      shortDescription: true,
      description: true,
    },
  });
  if (sub) {
    return {
      name: sub.name,
      metaTitle: sub.metaTitle,
      metaDescription: sub.metaDescription,
      shortDescription: sub.shortDescription,
      description: sub.description,
    };
  }

  const cat = await prisma.category.findFirst({
    where: { slug, deletedAt: null, isActive: true },
    select: {
      name: true,
      metaTitle: true,
      metaDescription: true,
      shortDescription: true,
      description: true,
    },
  });
  return cat;
}

export async function listCategoriesForSelect() {
  return prisma.category.findMany({
    where: { deletedAt: null },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });
}
