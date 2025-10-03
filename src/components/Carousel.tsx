"use client"
import React, { useState, useEffect, useCallback, useRef } from "react"
import useEmblaCarousel from "embla-carousel-react"
import type { EmblaOptionsType } from "embla-carousel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
  const [modalImage, setModalImage] = useState<string | null>(null)

  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(options)
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  })

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
            <Dialog key={index} onOpenChange={(open) => !open && setModalImage(null)}>
              <DialogTrigger asChild>
                <div
                  className="flex-[0_0_100%] px-2 cursor-pointer"
                  onClick={() => setModalImage(src)}
                >
                  <img
                    src={src}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-72 object-cover rounded-xl shadow-md"
                  />
                </div>
              </DialogTrigger>
              <DialogContent className="flex flex-col w-fit max-w-5xl p-0 border-0 bg-yellow-100 shadow-none">
                <DialogHeader>
                  <DialogTitle className="sr-only">Are you absolutely sure?</DialogTitle>
                  <DialogDescription className="sr-only">
                    This action cannot be undone. This will permanently delete your account
                    and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                {modalImage && (
                  <img
                    src={modalImage}
                    alt="Full Image"
                    className="max-h-[90vh] max-w-full object-contain rounded-lg"
                  />
                )}
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>

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
