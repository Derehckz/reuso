"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  FolderTree,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AdminCategoryTreeChild,
  AdminCategoryTreeNode,
} from "@/types/admin-category";

const STORAGE_KEY = "reuso-admin-category-tree-expanded";

type SelectedNode = {
  id: string;
  type: "category" | "subcategory";
};

type CategoryTreeSidebarProps = {
  tree: AdminCategoryTreeNode[];
  selected: SelectedNode | null;
  checked: Set<string>;
  onSelect: (node: SelectedNode) => void;
  onCheck: (key: string, checked: boolean) => void;
  onReorder: (
    items: { id: string; type: "category" | "subcategory"; sortOrder: number }[],
  ) => void;
};

function nodeKey(id: string, type: string) {
  return `${type}:${id}`;
}

export function CategoryTreeSidebar({
  tree,
  selected,
  checked,
  onSelect,
  onCheck,
  onReorder,
}: CategoryTreeSidebarProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [dragId, setDragId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setExpanded(new Set(JSON.parse(raw) as string[]));
      else setExpanded(new Set(tree.map((c) => c.id)));
    } catch {
      setExpanded(new Set(tree.map((c) => c.id)));
    }
  }, [tree]);

  const persistExpanded = useCallback((next: Set<string>) => {
    setExpanded(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      /* ignore */
    }
  }, []);

  const expandAll = () => persistExpanded(new Set(tree.map((c) => c.id)));
  const collapseAll = () => persistExpanded(new Set());

  const toggleExpand = (id: string) => {
    const next = new Set(expanded);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persistExpanded(next);
  };

  const flatOrder = useMemo(() => {
    const items: { id: string; type: "category" | "subcategory"; sortOrder: number }[] =
      [];
    tree.forEach((cat, ci) => {
      items.push({ id: cat.id, type: "category", sortOrder: ci });
      cat.children.forEach((sub, si) => {
        items.push({ id: sub.id, type: "subcategory", sortOrder: si });
      });
    });
    return items;
  }, [tree]);

  function handleDrop(targetId: string, targetType: "category" | "subcategory") {
    if (!dragId) return;
    const [dragType, dragNodeId] = dragId.split(":") as [
      "category" | "subcategory",
      string,
    ];
    if (dragNodeId === targetId) return;

    const order = [...flatOrder];
    const fromIdx = order.findIndex(
      (o) => o.id === dragNodeId && o.type === dragType,
    );
    const toIdx = order.findIndex(
      (o) => o.id === targetId && o.type === targetType,
    );
    if (fromIdx < 0 || toIdx < 0) return;

    const [moved] = order.splice(fromIdx, 1);
    order.splice(toIdx, 0, moved);

    if (dragType === "category" && targetType === "category") {
      const cats = order.filter((o) => o.type === "category");
      cats.forEach((c, i) => {
        c.sortOrder = i;
      });
      onReorder(cats);
    } else if (dragType === "subcategory" && targetType === "subcategory") {
      const parent = tree.find((c) =>
        c.children.some((s) => s.id === dragNodeId || s.id === targetId),
      );
      if (!parent) return;
      const subs = parent.children.map((s, i) => ({
        id: s.id,
        type: "subcategory" as const,
        sortOrder: i,
      }));
      const fromSub = subs.findIndex((s) => s.id === dragNodeId);
      const toSub = subs.findIndex((s) => s.id === targetId);
      if (fromSub < 0 || toSub < 0) return;
      const [m] = subs.splice(fromSub, 1);
      subs.splice(toSub, 0, m);
      subs.forEach((s, i) => {
        s.sortOrder = i;
      });
      onReorder(subs);
    }
    setDragId(null);
  }

  function renderChild(sub: AdminCategoryTreeChild) {
    const key = nodeKey(sub.id, "subcategory");
    const isSelected =
      selected?.id === sub.id && selected.type === "subcategory";

    return (
      <div
        key={sub.id}
        draggable
        onDragStart={() => setDragId(`subcategory:${sub.id}`)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => handleDrop(sub.id, "subcategory")}
        className={cn(
          "group flex items-center gap-1 rounded-sm py-1.5 pl-8 pr-2 text-xs",
          isSelected ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10",
        )}
      >
        <input
          type="checkbox"
          className="accent-brand-orange"
          checked={checked.has(key)}
          onChange={(e) => onCheck(key, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
        />
        <GripVertical className="h-3 w-3 shrink-0 cursor-grab opacity-40" />
        <button
          type="button"
          className="min-w-0 flex-1 truncate text-left"
          onClick={() => onSelect({ id: sub.id, type: "subcategory" })}
        >
          {sub.name}
          <span className="ml-1 text-[10px] opacity-50">({sub.productCount})</span>
          {sub.isEmpty && (
            <span className="ml-1 rounded bg-white/20 px-1 text-[9px]">vacía</span>
          )}
        </button>
        {!sub.isActive && (
          <span className="text-[9px] uppercase text-amber-300">off</span>
        )}
      </div>
    );
  }

  function renderCategory(cat: AdminCategoryTreeNode) {
    const isExpanded = expanded.has(cat.id);
    const isSelected = selected?.id === cat.id && selected.type === "category";
    const key = nodeKey(cat.id, "category");

    return (
      <div key={cat.id}>
        <div
          draggable
          onDragStart={() => setDragId(`category:${cat.id}`)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(cat.id, "category")}
          className={cn(
            "group flex items-center gap-1 rounded-sm py-2 px-2",
            isSelected ? "bg-white/15 text-white" : "text-white/90 hover:bg-white/10",
          )}
        >
          <input
            type="checkbox"
            className="accent-brand-orange"
            checked={checked.has(key)}
            onChange={(e) => onCheck(key, e.target.checked)}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="shrink-0 p-0.5"
            onClick={() => toggleExpand(cat.id)}
            aria-label={isExpanded ? "Contraer" : "Expandir"}
          >
            {cat.children.length > 0 ? (
              isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )
            ) : (
              <span className="inline-block w-3.5" />
            )}
          </button>
          <GripVertical className="h-3.5 w-3.5 shrink-0 cursor-grab opacity-40" />
          <button
            type="button"
            className="min-w-0 flex-1 truncate text-left text-xs font-medium uppercase tracking-wide"
            onClick={() => onSelect({ id: cat.id, type: "category" })}
          >
            {cat.name}
            <span className="ml-1 font-normal text-[10px] opacity-60">
              ({cat.productCount})
            </span>
            {cat.isEmpty && (
              <span className="ml-1 rounded bg-white/20 px-1 text-[9px] normal-case">
                vacía
              </span>
            )}
          </button>
          {!cat.isActive && (
            <span className="text-[9px] uppercase text-amber-300">off</span>
          )}
        </div>
        {isExpanded &&
          cat.children.map((sub) => renderChild(sub))}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-brand-green text-white">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-3">
        <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
          <FolderTree className="h-4 w-4" strokeWidth={1.5} />
          Árbol
        </span>
        <div className="flex gap-2 text-[9px] uppercase tracking-wider text-white/50">
          <button type="button" className="hover:text-white" onClick={expandAll}>
            Expandir
          </button>
          <button type="button" className="hover:text-white" onClick={collapseAll}>
            Contraer
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {tree.length === 0 ? (
          <p className="px-2 py-4 text-xs text-white/50">Sin categorías</p>
        ) : (
          tree.map(renderCategory)
        )}
      </div>
    </div>
  );
}
