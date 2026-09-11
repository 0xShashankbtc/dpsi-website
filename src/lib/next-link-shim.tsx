import React from "react";
import { Link as RouterLink } from "react-router";

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  to?: string;
  children?: React.ReactNode;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, to, children, ...props },
  ref
) {
  const targetUrl = href || to || "#";
  const isExternal =
    targetUrl.startsWith("http://") ||
    targetUrl.startsWith("https://") ||
    targetUrl.startsWith("mailto:") ||
    targetUrl.startsWith("tel:") ||
    targetUrl === "#";

  if (isExternal) {
    return (
      <a ref={ref} href={targetUrl} {...props}>
        {children}
      </a>
    );
  }

  return (
    <RouterLink ref={ref} to={targetUrl} {...props}>
      {children}
    </RouterLink>
  );
});

export default Link;
