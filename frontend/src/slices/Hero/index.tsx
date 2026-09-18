"use client";

import { asText, Content } from "@prismicio/client";
import { PrismicNextImage } from "@prismicio/next";
import {
  PrismicRichText,
  SliceComponentProps,
} from "@prismicio/react";

import Link from "next/link";

import { Bounded } from "@/components/Bounded";
import { TextSplitter } from "@/components/TextSplitter";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import ScrollTrigger from "gsap/ScrollTrigger";

import { View } from "@react-three/drei";
import Scene from "./Scene";
import { Bubbles } from "./Bubbles";

import { useStore } from "@/hooks/useStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type HeroProps =
  SliceComponentProps<Content.HeroSlice>;

const Hero = ({
  slice,
}: HeroProps): JSX.Element => {
  const ready = useStore((state) => state.ready);

  const isDesktop = useMediaQuery(
    "(min-width: 768px)",
    true,
  );

  useGSAP(
    () => {
      if (!ready && isDesktop) return;

      const introTL = gsap.timeline();

      introTL
        .set(".hero", {
          opacity: 1,
        })
        .from(".hero-header-word", {
          scale: 4,
          opacity: 0,
          ease: "power4.in",
          delay: 0.3,
          stagger: 0.8,
        })
        .from(
          ".hero-subheading",
          {
            opacity: 0,
            y: 30,
          },
          "+=.8",
        )
        .from(".hero-body", {
          opacity: 0,
          y: 10,
        })
        .from(".hero-button", {
          opacity: 0,
          y: 10,
          duration: 0.6,
        });

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
        },
      });

      scrollTl
        .fromTo(
          "body",
          {
            backgroundColor: "#FDE047",
          },
          {
            backgroundColor: "#D9F99D",
            overwrite: "auto",
          },
          1.5,
        )
        .from(
          ".text-side-heading .split-char",
          {
            scale: 1.3,
            y: 40,
            rotate: -25,
            opacity: 0,
            stagger: 0.1,
            ease: "back.out(3)",
            duration: 0.5,
          },
        )
        .from(".text-side-body", {
          y: 20,
          opacity: 0,
        });
    },
    {
      dependencies: [ready, isDesktop],
    },
  );

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="hero opacity-0"
    >
      {/* 3D SCENE */}
      {isDesktop && (
        <View className="hero-scene pointer-events-none sticky top-0 z-50 -mt-[100vh] hidden h-screen w-screen md:block">
          <Scene />
          <Bubbles speed={2} />
        </View>
      )}

      <div className="grid">
        {/* HERO SECTION */}
        <div className="grid h-screen place-content-center">
          <div className="relative z-[9999] grid auto-rows-min place-items-center text-center">
            <h1 className="hero-header text-7xl font-black uppercase leading-[.8] text-orange-500 md:text-[9rem] lg:text-[13rem]">
              <TextSplitter
                text={asText(slice.primary.heading)}
                wordDisplayStyle="block"
                className="hero-header-word"
              />
            </h1>

            <div className="hero-subheading mt-12 text-5xl font-semibold text-sky-950 lg:text-6xl">
              <PrismicRichText
                field={slice.primary.subheading}
              />
            </div>

            <div className="hero-body text-2xl font-normal text-sky-950">
              <PrismicRichText
                field={slice.primary.body}
              />
            </div>

            {/* TOP ORDER NOW BUTTON */}
            <Link
              href="/products"
              className="hero-button pointer-events-auto relative z-[99999] mt-12 cursor-pointer rounded-xl bg-orange-600 px-8 py-5 text-2xl font-bold uppercase text-white shadow-lg transition-all duration-300 hover:scale-105 hover:bg-orange-700 active:scale-95"
            >
              Order Now
            </Link>
          </div>
        </div>

        {/* SECOND SECTION */}
        <div className="text-side relative z-[9999] grid min-h-screen items-center gap-4 py-20 md:grid-cols-2">
          <div>
            <PrismicNextImage
              className="w-full md:hidden"
              field={slice.primary.cans_image}
            />

            <h2 className="text-side-heading text-balance text-6xl font-black uppercase text-sky-950 lg:text-8xl">
              <TextSplitter
                text={asText(
                  slice.primary.second_heading,
                )}
              />
            </h2>

            <div className="text-side-body mt-4 max-w-xl text-balance text-xl font-normal text-slate-950">
              <PrismicRichText
                field={slice.primary.second_body}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM SHOP NOW SECTION */}
        <div className="relative z-[99999] flex min-h-[300px] flex-col items-center justify-center gap-6 py-20 text-center">
          <h2 className="text-4xl font-black uppercase text-sky-950 md:text-6xl">
            Ready To Try Fizzi?
          </h2>

          <p className="max-w-xl text-xl text-sky-950">
            Explore all available flavors and order your
            favorite cans.
          </p>

        </div>
      </div>
    </Bounded>
  );
};

export default Hero;