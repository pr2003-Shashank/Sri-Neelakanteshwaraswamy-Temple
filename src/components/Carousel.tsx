"use client"
import React, { useState, useEffect, useCallback, useRef } from "react"
import useEmblaCarousel from "embla-carousel-react"
import type { EmblaOptionsType } from "embla-carousel"
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";


type EmblaCarouselProps = {
  images: string[]
  options?: EmblaOptionsType
  autoplay?: boolean
  autoplayDelay?: number // ms, default 3000
  className?: string
}

const EmblaCarousel: React.FC<EmblaCarouselProps> = ({
  images,
  options,
  autoplay = false,
  autoplayDelay = 3000,
  className,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(options)
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  })

  const [current, setCurrent] = useState<number | null>(null);

  const close = () => setCurrent(null);
  const prev = () => setCurrent((c) => (c! > 0 ? c! - 1 : images.length - 1));
  const next = () => setCurrent((c) => (c! < images.length - 1 ? c! + 1 : 0));

  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi) return
      emblaMainApi.scrollTo(index)
    },
    [emblaMainApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaMainApi) return
    setSelectedIndex(emblaMainApi.selectedScrollSnap())
    emblaThumbsApi?.scrollTo(emblaMainApi.selectedScrollSnap())
  }, [emblaMainApi, emblaThumbsApi])

  // Setup selection listener
  useEffect(() => {
    if (!emblaMainApi) return
    onSelect()
    emblaMainApi.on("select", onSelect).on("reInit", onSelect)
  }, [emblaMainApi, onSelect])

  // Autoplay effect
  useEffect(() => {
    if (!emblaMainApi || !autoplay) return
    const play = () => {
      if (!emblaMainApi) return
      emblaMainApi.scrollNext()
    }

    autoplayRef.current = setInterval(play, autoplayDelay)

    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current)
    }
  }, [emblaMainApi, autoplay, autoplayDelay])

  return (
    <div className={`w-full max-w-3xl mx-auto ${className || ""}`}>
      {/* Main carousel */}
      <div className="overflow-hidden" ref={emblaMainRef}>
        <div className="flex">
          {images.map((src, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] px-2 cursor-pointer"
              onClick={() => setCurrent(index)} 
            >
              <img
                src={src}
                alt={`Slide ${index + 1}`}
                className="w-full h-72 object-cover rounded-xl shadow-md"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen lightbox */}
      {current !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          {/* Close button */}
          <Button
            onClick={close}
            className="absolute top-4 right-4 text-white rounded-full text-2xl"
          >
            <X />
          </Button>

          {/* Prev button */}
          <Button
            onClick={prev}
            className="absolute bg-yellow-100 rounded-full left-4 text-yellow-900 text-2xl"
          >
            <ChevronLeft className="h-6 w-6 md:h-10 md:w-10"/>
          </Button>

          {/* Next button */}
          <Button
            onClick={next}
            className="absolute right-4 bg-yellow-100 text-yellow-900 rounded-full text-2xl"
          >
            <ChevronRight className="h-6 w-6 md:h-10 md:w-10"/>
          </Button>

          {/* Image */}
          <img
            src={images[current]}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-lg"
          />
        </div>
      )}

      {/* Thumbnails */}
      <div className="mt-4 overflow-hidden" ref={emblaThumbsRef}>
        <div className="flex">
          {images.map((src, index) => (
            <div
              key={index}
              className="flex-[0_0_20%] px-1"
            >
              <button
                onClick={() => onThumbClick(index)}
                type="button"
                className={`w-full h-20 rounded-md overflow-hidden border-2 ${index === selectedIndex
                  ? "border-blue-500"
                  : "border-transparent"
                  }`}
              >
                <img
                  src={src}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover opacity-70 hover:opacity-100 transition"
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EmblaCarousel
