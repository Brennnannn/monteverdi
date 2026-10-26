"use client"

import * as React from "react"
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from '@ui'
import { twMerge } from "tailwind-merge"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

/**
 * Root carousel container powered by Embla Carousel.
 * Provides carousel context (scroll state, API) to child components.
 * Supports keyboard navigation via arrow keys.
 *
 * @param {"horizontal" | "vertical"} [orientation="horizontal"] - Scroll direction
 * @param {CarouselOptions} [opts] - Embla carousel options passed directly to the engine
 * @param {CarouselPlugin} [plugins] - Embla plugins (e.g. autoplay)
 * @param {(api: CarouselApi) => void} [setApi] - Callback to receive the Embla API instance
 * @param {string} [className] - Additional Tailwind classes on the root div
 * @param {React.ReactNode} children - Must include `CarouselContent` and optionally `CarouselPrevious`/`CarouselNext`
 *
 * @example
 * ```tsx
 * <Carousel>
 *   <CarouselContent>
 *     <CarouselItem>Slide 1</CarouselItem>
 *     <CarouselItem>Slide 2</CarouselItem>
 *   </CarouselContent>
 *   <CarouselPrevious />
 *   <CarouselNext />
 * </Carousel>
 * ```
 */
function Carousel({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & CarouselProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) {
      return
    }

    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) {
      return
    }

    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) {
      return
    }

    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation:
          orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        onKeyDownCapture={handleKeyDown}
        className={twMerge("relative", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}
Carousel.displayName = "Carousel"

/**
 * The scrollable viewport inside `Carousel`. Wraps slides in a flex row or column.
 * Must be a direct child of `Carousel`.
 *
 * @param {string} [className] - Additional classes merged onto the inner flex container
 *
 * @example
 * ```tsx
 * <CarouselContent>
 *   <CarouselItem>...</CarouselItem>
 * </CarouselContent>
 * ```
 */
function CarouselContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="h-full overflow-hidden">
      <div
        className={twMerge(
          "flex",
          orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
          className
        )}
        {...props}
      />
    </div>
  )
}
CarouselContent.displayName = "CarouselContent"

/**
 * A single slide within `CarouselContent`. Takes the full carousel width by default.
 *
 * @param {string} [className] - Additional classes merged onto the slide wrapper
 *
 * @example
 * ```tsx
 * <CarouselItem>
 *   <img src="/photo.jpg" alt="slide" />
 * </CarouselItem>
 * ```
 */
function CarouselItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { orientation } = useCarousel()

  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={twMerge(
        "min-w-0 shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "pl-4" : "pt-4",
        className
      )}
      {...props}
    />
  )
}
CarouselItem.displayName = "CarouselItem"

/**
 * A circular previous-slide button absolutely positioned to the left of `Carousel`.
 * Disabled automatically when there is no previous slide.
 *
 * @param {string} [className] - Additional classes merged onto the button
 *
 * @example
 * ```tsx
 * <CarouselPrevious />
 * ```
 */
function CarouselPrevious({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      className={twMerge(
        "absolute h-8 w-8 !p-2 rounded-full -left-10 top-1/2 -translate-y-1/2",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
}
CarouselPrevious.displayName = "CarouselPrevious"

/**
 * A circular next-slide button absolutely positioned to the right of `Carousel`.
 * Disabled automatically when there is no next slide.
 *
 * @param {string} [className] - Additional classes merged onto the button
 *
 * @example
 * ```tsx
 * <CarouselNext />
 * ```
 */
function CarouselNext({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      className={twMerge(
        "absolute !p-2 h-8 w-8 rounded-full -right-10 top-1/2 -translate-y-1/2",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
}
CarouselNext.displayName = "CarouselNext"

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
}
