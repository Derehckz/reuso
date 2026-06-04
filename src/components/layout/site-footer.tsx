import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Divider } from "@/components/ui/divider";
import { siteConfig } from "@/config/site";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { FooterAccordion } from "./footer-accordion";
import { Logo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer
      className="bg-brand-green text-white"
      role="contentinfo"
    >
      <Container className="section-editorial !pb-12 !pt-16">
        <div className="mb-12 lg:hidden">
          <Logo variant="light" className="mb-8" size="lg" />
        </div>

        <div className="grid gap-0 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            <div className="grid lg:grid-cols-3 lg:gap-8">
              <FooterAccordion
                title="Categorías"
                links={siteConfig.footer.categories}
                defaultOpen
                tone="dark"
              />
              <FooterAccordion
                title="Consultas"
                links={siteConfig.footer.consultas}
                tone="dark"
              />
              <FooterAccordion
                title="Información"
                links={siteConfig.footer.informacion}
                tone="dark"
              />
            </div>

            <div className="mt-8 hidden items-center gap-3 lg:flex">
              <span className="text-label-sm text-white/60">Síguenos</span>
              <div className="flex gap-2">
                {[
                  { label: "FB", href: siteConfig.links.facebook },
                  { label: "IG", href: siteConfig.links.instagram },
                  { label: "PI", href: siteConfig.links.pinterest },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-label-sm text-white transition-all duration-300 hover:bg-white/20"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/15 pt-8 lg:col-span-4 lg:mt-0 lg:border-0 lg:pt-0">
            <NewsletterForm tone="dark" />
            <div className="mt-6 flex gap-2 lg:hidden">
              {[
                { label: "FB", href: siteConfig.links.facebook },
                { label: "IG", href: siteConfig.links.instagram },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-label-sm text-white"
                >
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>

      <Divider className="border-white/15" />

      <Container className="flex flex-col items-center justify-between gap-3 py-6 md:flex-row">
        <p className="text-label-sm text-white/60">
          © {new Date().getFullYear()} {siteConfig.name.toUpperCase()}
        </p>
        <p className="font-editorial text-sm italic text-white/80">
          Lo normal es opcional
        </p>
      </Container>
    </footer>
  );
}
