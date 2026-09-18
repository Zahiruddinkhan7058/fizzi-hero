"use client"

import { Bounded } from "@/components/Bounded";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import Scene from "./Scene";
import {View } from "@react-three/drei";

import { useEffect } from "react";
import ScrollTrigger from "gsap/ScrollTrigger";

/**
 * Props for `SkyDive`.
 */
export type SkyDiveProps = SliceComponentProps<Content.SkyDiveSlice>;

/**
 * Component for "SkyDive" Slices.
 */
const SkyDive = ({ slice }: SkyDiveProps): JSX.Element => {
  useEffect(() => {
    return () => {
      try {
        ScrollTrigger.getAll().forEach((st) => {
          if (
            st.vars.trigger === ".skydive" ||
            (st.trigger as HTMLElement)?.classList?.contains("skydive")
          ) {
            const trigger = st as unknown as { revert?: () => void };
            if (typeof trigger.revert === "function") {
              trigger.revert();
            }
            st.kill(true);
          }
        });
      } catch {
        // Ignore if already cleaned up
      }
    };
  }, []);

  return (
    <Bounded
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="skydive h-screen"
    >
      <View className="h-screen w-screen">
        <Scene flavor={slice.primary.flavor} sentence={slice.primary.sentence}/>
      </View>
      <h2 className="sr-only">{slice.primary.sentence}</h2>
    </Bounded>
  );
};




export default SkyDive;
