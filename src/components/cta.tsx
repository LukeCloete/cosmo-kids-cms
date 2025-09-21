'use client';

import { Button } from "./ui/button";

interface CTAProps {
  p: string;
}

export function CTA({ p }: CTAProps) {
  return (
    <section className="py-20 bg-orange-500 text-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-2xl mb-8">{p}</p>
        <Button variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-orange-500">
          Enroll Now
        </Button>
      </div>
    </section>
  );
}
