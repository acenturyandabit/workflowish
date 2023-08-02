import * as React from 'react';
import "./FloatyRegion.css"

export const FloatyRegion = (props: React.PropsWithChildren<{
    style?: React.CSSProperties,
    stickyHeightPct: number
}>) => {
    // code derived from https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport
    const spanRef = React.useRef<HTMLSpanElement>(null);
    React.useEffect(() => {
        const viewport = window.visualViewport;
        if (viewport) {
            const layoutSpannerDiv = document.createElement("div");
            document.body.appendChild(layoutSpannerDiv);
            layoutSpannerDiv.style.position = "fixed";
            layoutSpannerDiv.style.width = "100%";
            layoutSpannerDiv.style.height = "100%";
            layoutSpannerDiv.style.visibility = "hidden";
            const viewportHandler = () => {
                if (viewport) {
                    const offsetX = viewport.offsetLeft;
                    const offsetY = (viewport.height
                        - layoutSpannerDiv.getBoundingClientRect().height) * props.stickyHeightPct / 100
                        + viewport.offsetTop;
                    const currentSpan = spanRef.current;
                    if (currentSpan) currentSpan.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${1 / viewport.scale})`;
                }
            }
            viewport.addEventListener("scroll", viewportHandler);
            viewport.addEventListener('resize', viewportHandler);

            return () => {
                viewport.removeEventListener("scroll", viewportHandler);
                viewport.removeEventListener('resize', viewportHandler);

                layoutSpannerDiv.remove();
            }
        }
    }, [])
    return <>
        <span className="floatyRegion" ref={spanRef} style={props.style}>
            {props.children}
        </span>
    </>
}