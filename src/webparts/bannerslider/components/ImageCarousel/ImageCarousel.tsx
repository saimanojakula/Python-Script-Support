import { WebPartContext } from '@microsoft/sp-webpart-base';
import * as React from 'react';
import { FC, useEffect, useRef, useState, useCallback } from "react";
import { getListItems } from '../../services/SPServices';
import { listItemProperties } from '../../common/DataObject';
import { ISlides } from '../../common/Types';

const LOG_SOURCE: string = 'ImageCarousel';
//let totalSlides:number = 0;
const ImageCarousel: FC<{ context: WebPartContext; title: string; selectedLibrary: string }> = ({ context, title, selectedLibrary }) => {
    const slidesLengthRef = useRef<number>(0);
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [slides, setSlides] = useState<ISlides[]>([]);

    const nextSlide = useCallback(() => {
        if (slidesLengthRef.current === 0) return;
        setCurrentSlide(current => {
            const next = current === slidesLengthRef.current - 1 ? 0 : current + 1;
            return next;
        });
    }, []);

    useEffect(() => {
        slidesLengthRef.current = slides.length;
    }, [slides]);

    const prevSlide = useCallback(() => {
        if (slidesLengthRef.current === 0) return;
        setCurrentSlide((current) => {
            const prev = current === 0 ? (slidesLengthRef.current - 1) : current - 1;
            return prev;
        });

    }, []);

    const goToSlide = useCallback((index: number): void => {
        setCurrentSlide(index);
    }, []);



    const startAutoSlide = useCallback((): void => {
        intervalRef.current = setInterval(() => {
            nextSlide();
        }, 5000);
    }, [nextSlide]);

    const stopAutoSlide = useCallback((): void => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
    }, []);

    useEffect(() => {
        startAutoSlide();
        return () => stopAutoSlide();

    }, []);

    // Pause/resume on hover
    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            container.addEventListener("mouseenter", stopAutoSlide);
            container.addEventListener("mouseleave", startAutoSlide);
        }
        return () => {
            container?.removeEventListener("mouseenter", stopAutoSlide);
            container?.removeEventListener("mouseleave", startAutoSlide);
        };
    }, []);

    const getBannerImages = async (): Promise<void> => {
        try {
            const bannerSlides = await getListItems<ISlides>(context, selectedLibrary, listItemProperties);

            if (bannerSlides.length > 0) {
                slidesLengthRef.current = bannerSlides.length;
                setSlides(bannerSlides);
            }

        } catch (error) {
            return Promise.reject(error);
        }
    };

    useEffect(() => {
        (async () => {
            if (selectedLibrary) {
                await getBannerImages();
            }
        })().catch((error) => console.error(`${LOG_SOURCE}-getBannerImages()`, error?.message ? error.message : error));


    }, [selectedLibrary]);




    return (
        <div className="min-h-[250px] bg-white" ref={containerRef}>
            {slides.length > 0 ?
                (<div className="relative w-full h-[600px] overflow-hidden">
                    {/* Carousel Container */}
                    <div className="relative w-full h-full">
                        {/* Slides */}
                        {slides && slides.map((slide, index) => (
                            <div
                                key={index}
                                className={`absolute top-0 left-0 w-full h-full transition-opacity duration-500 ease-in-out ${currentSlide === index ? "opacity-100 z-0" : "opacity-0 z-0"
                                    }`}
                            >
                                {/* Background Image with Overlay */}
                                <img
                                    src={slide.FileRef}
                                    alt={slide.Title}
                                    className="absolute w-full h-full object-cover object-top"
                                />

                                {/* Content */}
                                <div className="absolute bottom-0 left-0 w-full text-white p-6 h-[160px]" style={{ backgroundImage: 'linear-gradient(180deg,rgba(0, 0, 0, 0) 5%, rgba(0, 0, 0, .6) 60%, rgba(0, 0, 0, 1) 80%)' }}>
                                    <a className={`text-3xl font-bold mb-2 cursor-pointer line-clamp-1  ${slide?.Link?.Url ? 'cursor-pointer underline' : 'cursor-none'}`} onClick={() => { if (slide?.Link?.Url) window.location.href = slide.Link.Url; }}>{slide.Title}</a>
                                    <p className="text-xl line-clamp-1" title={slide?.BannerDescription}>{slide.BannerDescription}</p>
                                </div>


                            </div>
                        ))}

                        {/* Navigation Arrows */}
                        <button
                            onClick={prevSlide}
                            className="text-2xl absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer whitespace-nowrap !rounded-button"
                            aria-label="Previous slide"
                        >
                            <i className="ri-arrow-left-s-line" />
                        </button>

                        <button
                            onClick={nextSlide}
                            className="text-2xl absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center cursor-pointer whitespace-nowrap !rounded-button"
                            aria-label="Next slide"
                        >
                            <i className="ri-arrow-right-s-line" />
                        </button>

                        {/* Pagination Indicators */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
                            {slides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => goToSlide(index)}
                                    className={`w-3 h-3 rounded-full cursor-pointer whitespace-nowrap !rounded-button ${currentSlide === index ? "bg-yellow-500" : "bg-white"
                                        }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>) : null}
        </div>
    );
};

export default ImageCarousel;
