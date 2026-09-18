"use client";

import FloatingCan from "@/components/FloatingCan";
import { SodaCanProps } from "@/components/SodaCan";
import { getProducts, Product } from "@/lib/products";

import { Content } from "@prismicio/client";
import {
  PrismicText,
  SliceComponentProps,
} from "@prismicio/react";

import {
  Center,
  Environment,
  View,
} from "@react-three/drei";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Group } from "three";
import clsx from "clsx";
import gsap from "gsap";

import { ArrowIcon } from "./ArrowIcon";
import { WavyCircles } from "./WavyCircles";

const SPINS_ON_CHANGE = 8;

const FLAVORS: {
  flavor: SodaCanProps["flavor"];
  color: string;
  name: string;
}[] = [
  {
    flavor: "blackCherry",
    color: "#710523",
    name: "Black Cherry",
  },
  {
    flavor: "grape",
    color: "#572981",
    name: "Grape Goodness",
  },
  {
    flavor: "lemonLime",
    color: "#164405",
    name: "Lemon Lime",
  },
  {
    flavor: "strawberryLemonade",
    color: "#690B3D",
    name: "Strawberry Lemonade",
  },
  {
    flavor: "watermelon",
    color: "#4B7002",
    name: "Watermelon Crush",
  },
];

export type CarouselProps =
  SliceComponentProps<Content.CarouselSlice>;

const Carousel = ({
  slice,
}: CarouselProps): JSX.Element => {
  const [
    currentFlavorIndex,
    setCurrentFlavorIndex,
  ] = useState(0);

  const [products, setProducts] =
    useState<Product[]>([]);

  const sodaCanRef = useRef<Group>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();

        console.log(
          "Products loaded:",
          data,
        );

        setProducts(data);
      } catch (error) {
        console.error(
          "Failed to load products:",
          error,
        );
      }
    }

    loadProducts();
  }, []);

  const totalItems =
    products.length > 0
      ? Math.min(
          products.length,
          FLAVORS.length,
        )
      : FLAVORS.length;

  const currentProduct =
    products[currentFlavorIndex] || null;

  const currentFlavor =
    FLAVORS[
      currentFlavorIndex % FLAVORS.length
    ];

  function changeFlavor(index: number) {
    if (!sodaCanRef.current) {
      return;
    }

    const nextIndex =
      (index + totalItems) % totalItems;

    const nextFlavor =
      FLAVORS[
        nextIndex % FLAVORS.length
      ];

    const timeline = gsap.timeline();

    timeline
      .to(
        sodaCanRef.current.rotation,
        {
          y:
            index > currentFlavorIndex
              ? `-=${
                  Math.PI *
                  2 *
                  SPINS_ON_CHANGE
                }`
              : `+=${
                  Math.PI *
                  2 *
                  SPINS_ON_CHANGE
                }`,
          ease: "power2.inOut",
          duration: 1,
        },
        0,
      )
      .to(
        ".background",
        {
          backgroundColor:
            nextFlavor.color,
          ease: "power2.inOut",
          duration: 1,
        },
        0,
      )
      .to(
        ".wavy-circles-outer, .wavy-circles-inner",
        {
          fill: nextFlavor.color,
          ease: "power2.inOut",
          duration: 1,
        },
        0,
      )
      .to(
        ".text-wrapper",
        {
          y: -10,
          opacity: 0,
          duration: 0.2,
        },
        0,
      )
      .to(
        {},
        {
          onStart: () => {
            setCurrentFlavorIndex(
              nextIndex,
            );
          },
        },
        0.5,
      )
      .to(
        ".text-wrapper",
        {
          y: 0,
          opacity: 1,
          duration: 0.2,
        },
        0.7,
      );
  }

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={
        slice.variation
      }
      className="carousel relative grid h-screen grid-rows-[auto,4fr,auto] justify-center overflow-hidden bg-white py-12 text-white"
    >
      {/* Background */}
      <div
        className="background pointer-events-none absolute inset-0 z-0 opacity-50"
        style={{
          backgroundColor:
            currentFlavor.color,
        }}
      />

      {/* Wavy Circles */}
      <WavyCircles
        className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[120vmin] -translate-x-1/2 -translate-y-1/2"
        style={{
          color: currentFlavor.color,
        }}
      />

      {/* Heading */}
      <h2 className="relative z-20 text-center text-5xl font-bold">
        <PrismicText
          field={slice.primary.heading}
        />
      </h2>

      {/* Carousel */}
      <div className="relative z-50 grid grid-cols-[auto,auto,auto] items-center">
        {/* Left Button */}
        <ArrowButton
          onClick={() =>
            changeFlavor(
              currentFlavorIndex - 1,
            )
          }
          direction="left"
          label="Previous Flavor"
        />

        {/* 3D Can */}
        <View className="pointer-events-none relative z-10 aspect-square h-[70vmin] min-h-40">
          <Center
            position={[0, 0, 1.5]}
          >
            <FloatingCan
              ref={sodaCanRef}
              floatIntensity={0.3}
              rotationIntensity={1}
              flavor={
                currentFlavor.flavor
              }
            />
          </Center>

          <Environment
            files="/hdr/lobby.hdr"
            environmentIntensity={0.6}
            environmentRotation={[
              0,
              3,
              0,
            ]}
          />

          <directionalLight
            intensity={6}
            position={[0, 1, 1]}
          />
        </View>

        {/* Right Button */}
        <ArrowButton
          onClick={() =>
            changeFlavor(
              currentFlavorIndex + 1,
            )
          }
          direction="right"
          label="Next Flavor"
        />
      </div>

      {/* Product Info */}
      <div className="text-area relative z-50 mx-auto text-center">
        <div className="text-wrapper text-4xl font-medium">
          <p>
            {currentProduct
              ? currentProduct.name
              : currentFlavor.name}
          </p>
        </div>

        <div className="mt-2 text-2xl font-normal opacity-90">
          {currentProduct ? (
            `₹${currentProduct.price}`
          ) : (
            <PrismicText
              field={
                slice.primary.price_copy
              }
            />
          )}
        </div>
      </div>
    </section>
  );
};

type ArrowButtonProps = {
  direction?: "right" | "left";
  label: string;
  onClick: () => void;
};

function ArrowButton({
  label,
  direction = "right",
  onClick,
}: ArrowButtonProps) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        onClick();
      }}
      className="pointer-events-auto relative z-[999] size-12 cursor-pointer rounded-full border-2 border-white bg-black/40 p-3 text-white opacity-100 shadow-lg transition hover:scale-110 hover:bg-black/60 active:scale-95 md:size-16 lg:size-20"
    >
      <ArrowIcon
        className={clsx(
          "size-full",
          direction === "right" &&
            "-scale-x-100",
        )}
      />

      <span className="sr-only">
        {label}
      </span>
    </button>
  );
}

export default Carousel;