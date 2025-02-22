import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Fragment } from "react";

interface BreadcrumbItem {
  name: string;
  link?: string;
}

interface BreadCrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function BreadCrumbComponent({ items, className }: BreadCrumbProps) {
  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLastItem = index === items.length - 1;
          return (
            <Fragment key={index}>
              <BreadcrumbItem>
                {item.link ? (
                  <Link
                    className={`hover:underline font-medium ${isLastItem ? "text-foreground" : "text-foreground/70"}`}
                    href={item.link}
                  >
                    {item.name}
                  </Link>
                ) : (
                  <span className={`${isLastItem ? "text-foreground font-semibold" : ""}`}>{item.name}</span>
                )}
              </BreadcrumbItem>
              {index < items.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
