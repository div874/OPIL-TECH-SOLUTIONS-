class ScrollStack {
    constructor(options = {}) {
        this.options = Object.assign({
            itemDistance: 100,
            itemScale: 0.03,
            itemStackDistance: 30,
            stackPosition: '20%',
            scaleEndPosition: '10%',
            baseScale: 0.85,
            rotationAmount: 0,
            blurAmount: 0
        }, options);

        this.cards = Array.from(document.querySelectorAll('.scroll-stack-card'));
        this.endElement = document.querySelector('.scroll-stack-end');
        this.lastTransforms = new Map();
        this.isUpdating = false;
        
        // Cache layout properties to avoid thrashing during scroll
        this.cachedOffsets = [];
        this.cachedEndTop = 0;
        this.containerHeight = window.innerHeight;
        this.stackPositionPx = 0;
        this.scaleEndPositionPx = 0;

        this.init();
    }

    getAbsoluteOffsetTop(element) {
        let offsetTop = 0;
        let el = element;
        while (el) {
            offsetTop += el.offsetTop;
            el = el.offsetParent;
        }
        return offsetTop;
    }

    cacheLayout() {
        this.containerHeight = window.innerHeight;
        this.stackPositionPx = this.parsePercentage(this.options.stackPosition, this.containerHeight);
        this.scaleEndPositionPx = this.parsePercentage(this.options.scaleEndPosition, this.containerHeight);
        
        this.cachedOffsets = this.cards.map(card => {
            // Temporarily disable transform to get true offset
            const currentTransform = card.style.transform;
            card.style.transform = 'none';
            const offset = this.getAbsoluteOffsetTop(card);
            card.style.transform = currentTransform;
            return offset;
        });

        if (this.endElement) {
            this.cachedEndTop = this.getAbsoluteOffsetTop(this.endElement);
        }
    }

    init() {
        if (!this.cards.length) return;

        this.cards.forEach((card, i) => {
            if (i < this.cards.length - 1) {
                card.style.marginBottom = `${this.options.itemDistance}px`;
            }
            card.style.willChange = 'transform, filter';
            card.style.transformOrigin = 'top center';
            card.style.backfaceVisibility = 'hidden';
            card.style.transform = 'translateZ(0)';
            card.style.webkitTransform = 'translateZ(0)';
            card.style.perspective = '1000px';
            card.style.webkitPerspective = '1000px';
        });

        // Initial layout cache
        this.cacheLayout();
        
        // Recalculate on resize
        window.addEventListener('resize', () => {
            this.cacheLayout();
            this.updateTransforms();
        });

        if (!window.lenis) {
            window.lenis = new Lenis({
                duration: 1.2,
                easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                touchMultiplier: 1.5,
                infinite: false,
                wheelMultiplier: 0.6,
                lerp: 0.15
            });

            const raf = (time) => {
                window.lenis.raf(time);
                requestAnimationFrame(raf);
            };
            requestAnimationFrame(raf);
        }

        window.lenis.on('scroll', () => {
            this.updateTransforms();
        });
        
        window.addEventListener('scroll', () => {
            this.updateTransforms();
        }, {passive: true});
        
        this.updateTransforms();
    }

    calculateProgress(scrollTop, start, end) {
        if (scrollTop < start) return 0;
        if (scrollTop > end) return 1;
        return (scrollTop - start) / (end - start);
    }

    parsePercentage(value, containerHeight) {
        if (typeof value === 'string' && value.includes('%')) {
            return (parseFloat(value) / 100) * containerHeight;
        }
        return parseFloat(value);
    }

    updateTransforms() {
        this.isUpdating = true;

        const scrollTop = window.scrollY;

        this.cards.forEach((card, i) => {
            const offsetTop = this.cachedOffsets[i];
            const triggerStart = offsetTop - this.stackPositionPx - this.options.itemStackDistance * i;
            const triggerEnd = offsetTop - this.scaleEndPositionPx;
            const pinStart = offsetTop - this.stackPositionPx - this.options.itemStackDistance * i;
            const pinEnd = this.cachedEndTop - this.containerHeight / 2;

            const scaleProgress = this.calculateProgress(scrollTop, triggerStart, triggerEnd);
            const targetScale = this.options.baseScale + (i * this.options.itemScale);
            const scale = 1 - (scaleProgress * (1 - targetScale));
            const rotation = this.options.rotationAmount ? (i * this.options.rotationAmount * scaleProgress) : 0;

            let blur = 0;
            if (this.options.blurAmount) {
                let topCardIndex = 0;
                for (let j = 0; j < this.cards.length; j++) {
                    const jOffset = this.cachedOffsets[j];
                    const jTriggerStart = jOffset - this.stackPositionPx - this.options.itemStackDistance * j;
                    if (scrollTop >= jTriggerStart) {
                        topCardIndex = j;
                    }
                }
                if (i < topCardIndex) {
                    const depthInStack = topCardIndex - i;
                    blur = Math.max(0, depthInStack * this.options.blurAmount);
                }
            }

            let translateY = 0;
            const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

            if (isPinned) {
                translateY = scrollTop - offsetTop + this.stackPositionPx + this.options.itemStackDistance * i;
            } else if (scrollTop > pinEnd && pinEnd > 0) {
                translateY = pinEnd - offsetTop + this.stackPositionPx + this.options.itemStackDistance * i;
            }

            const newTransform = {
                translateY: Math.round(translateY * 100) / 100,
                scale: Math.round(scale * 1000) / 1000,
                rotation: Math.round(rotation * 100) / 100,
                blur: Math.round(blur * 100) / 100
            };

            const lastTransform = this.lastTransforms.get(i);
            const hasChanged = !lastTransform || 
                lastTransform.translateY !== newTransform.translateY ||
                lastTransform.scale !== newTransform.scale ||
                lastTransform.rotation !== newTransform.rotation ||
                lastTransform.blur !== newTransform.blur;

            if (hasChanged) {
                const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
                const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';
                
                card.style.transform = transform;
                card.style.filter = filter;
                
                this.lastTransforms.set(i, newTransform);
            }
        });

        this.isUpdating = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Slight delay to ensure layout is fully painted before caching offsets
    setTimeout(() => {
        if (document.querySelector('.scroll-stack-scroller')) {
            new ScrollStack({
                itemDistance: 100,
                itemScale: 0.03,
                itemStackDistance: 30,
                stackPosition: '20%',
                scaleEndPosition: '10%',
                baseScale: 0.85,
                rotationAmount: 0,
                blurAmount: 0
            });
        }
    }, 100);
});
