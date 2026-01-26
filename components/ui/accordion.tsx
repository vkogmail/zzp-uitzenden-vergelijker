"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "./utils";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("last:border-b-0", className)}
      style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left transition-all outline-none hover:underline cursor-pointer disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        style={{
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-foreground-default)',
          borderRadius: 'var(--radius-m)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--color-gray-50)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = 'var(--color-brand-blue)';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 133, 255, 0.5)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }}
        {...props}
      >
        {children}
        <ChevronDownIcon 
          className="pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" 
          style={{ color: 'var(--color-foreground-muted)' }}
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden"
      style={{ fontSize: 'var(--font-size-sm)' }}
      {...props}
    >
      <div className={cn("pt-0", className)} style={{ paddingBottom: 'var(--spacing-l)' }}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
