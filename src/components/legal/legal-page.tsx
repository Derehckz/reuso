import Link from "next/link";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs?: string[];
  list?: string[];
  subsections?: {
    title?: string;
    paragraphs?: string[];
    list?: string[];
  }[];
};

type LegalPageProps = {
  title: string;
  subtitle?: string;
  intro?: string[];
  sections: LegalSection[];
  contactEmail?: string;
};

export function LegalPage({
  title,
  subtitle,
  intro,
  sections,
  contactEmail = "contacto@re-uso.cl",
}: LegalPageProps) {
  return (
    <>
      <section className="border-b border-neutral-200 bg-brand-green text-white">
        <Container className="section-editorial py-14 text-center md:py-20">
          {subtitle && (
            <p className="text-label-sm text-brand-beige">{subtitle}</p>
          )}
          <h1 className="font-editorial mt-2 text-3xl md:text-4xl lg:text-5xl">
            {title}
          </h1>
        </Container>
      </section>

      <Container className="section-editorial max-w-3xl py-14 md:py-16">
        {intro && intro.length > 0 && (
          <div className="mb-12 space-y-4 border-b border-neutral-200 pb-10 text-sm leading-relaxed text-neutral-700 md:text-base">
            {intro.map((p) => (
              <p key={p.slice(0, 48)}>{p}</p>
            ))}
          </div>
        )}

        <div className="space-y-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-label text-brand-green">{section.title}</h2>

              <div className="mt-4 space-y-4 text-sm leading-relaxed text-neutral-700 md:text-base">
                {section.paragraphs?.map((p) => (
                  <p key={p.slice(0, 48)}>{formatLegalText(p, contactEmail)}</p>
                ))}

                {section.list && (
                  <ul className="list-disc space-y-2 pl-5">
                    {section.list.map((item) => (
                      <li key={item.slice(0, 48)}>
                        {formatLegalText(item, contactEmail)}
                      </li>
                    ))}
                  </ul>
                )}

                {section.subsections?.map((sub, i) => (
                  <div
                    key={`${section.id}-sub-${i}`}
                    className={cn(i > 0 && "mt-6")}
                  >
                    {sub.title && (
                      <h3 className="mb-2 text-sm font-semibold text-foreground">
                        {sub.title}
                      </h3>
                    )}
                    {sub.paragraphs?.map((p) => (
                      <p key={p.slice(0, 48)} className="mt-2">
                        {formatLegalText(p, contactEmail)}
                      </p>
                    ))}
                    {sub.list && (
                      <ul className="mt-2 list-disc space-y-2 pl-5">
                        {sub.list.map((item) => (
                          <li key={item.slice(0, 48)}>
                            {formatLegalText(item, contactEmail)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-14 border-t border-neutral-200 pt-8 text-sm text-neutral-500">
          Consultas:{" "}
          <Link
            href={`mailto:${contactEmail}`}
            className="text-brand-green underline-offset-2 hover:underline"
          >
            {contactEmail}
          </Link>
        </p>
      </Container>
    </>
  );
}

function formatLegalText(text: string, email: string) {
  const parts = text.split(email);
  if (parts.length === 1) return text;

  return parts.flatMap((part, i) => {
    if (i === 0) return [part];
    return [
      <Link
        key={`email-${i}`}
        href={`mailto:${email}`}
        className="text-brand-green underline-offset-2 hover:underline"
      >
        {email}
      </Link>,
      part,
    ];
  });
}
