
/**
 * QJS - The Lightweight Runtime for QCSS
 * 
 * Responsibilities:
 * 1. Efficiently manage DOM updates for large lists (Infinite Scroll, Virtual List).
 * 2. Dynamic class binding using QCSS Manifest.
 * 3. Zero-framework dependency (Vanilla JS).
 * 4. Reactivity System (Signals) for frequent updates (Bilibili/Games).
 * 5. High-performance Animation Engine (FLIP).
     * 6. State Bridge: Sync JS state to CSS Variables efficiently.
     */

export class QJS {
    constructor(manifest) {
        this.manifest = manifest || {};
        this.cache = new Map();
        this.signals = new WeakMap(); 
        this.root = document.documentElement; // Default root for CSS vars
    }

    /**
     * Bridge: Bind a Signal to a CSS Variable
     * Performance: Excellent. Browsers optimize CSS Var updates heavily.
     * No layout thrashing (unlike inline styles).
     * 
     * @param {string} varName - CSS Variable name (e.g., '--theme-color')
     * @param {Function} signalRead - The signal getter
     */
    bindVar(varName, signalRead) {
        this.effect(() => {
            const value = signalRead();
            this.root.style.setProperty(varName, value);
        });
    }

    /**
     * Bridge: Get CSS variable value into JS
     * Useful for Canvas/WebGL that needs to match CSS theme.
     */
    getVar(varName) {
        return getComputedStyle(this.root).getPropertyValue(varName).trim();
    }

    /**
     * Create a reactive signal
     * @param {any} initialValue 
     */
    signal(initialValue) {
        let value = initialValue;
        const subscribers = new Set();
        
        const read = () => {
            // If there's an active effect running, track it
            if (QJS.activeEffect) {
                subscribers.add(QJS.activeEffect);
            }
            return value;
        };
        
        const write = (newValue) => {
            if (value !== newValue) {
                value = newValue;
                // Notify subscribers
                subscribers.forEach(fn => fn());
            }
        };
        
        return [read, write];
    }

    /**
     * Run a side effect when signals change
     * @param {Function} fn 
     */
    effect(fn) {
        QJS.activeEffect = fn;
        fn();
        QJS.activeEffect = null;
    }

    /**
     * FLIP Animation Helper (First, Last, Invert, Play)
     * Essential for smooth list reordering in feeds.
     */
    flip(container, action) {
        // 1. First: Record initial positions
        const firstPositions = new Map();
        Array.from(container.children).forEach(child => {
            const id = child.getAttribute('key'); // Require key for animation
            if (id) {
                firstPositions.set(id, child.getBoundingClientRect());
            }
        });

        // 2. Action: Modify DOM
        action();

        // 3. Last: Record final positions and Invert
        Array.from(container.children).forEach(child => {
            const id = child.getAttribute('key');
            if (id) {
                const first = firstPositions.get(id);
                const last = child.getBoundingClientRect();
                
                if (first) {
                    const dx = first.left - last.left;
                    const dy = first.top - last.top;
                    
                    // Invert
                    if (dx !== 0 || dy !== 0) {
                        child.style.transform = `translate(${dx}px, ${dy}px)`;
                        child.style.transition = 'transform 0s';
                        
                        // 4. Play
                        requestAnimationFrame(() => {
                            child.style.transform = '';
                            child.style.transition = 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)';
                        });
                    }
                }
            }
        });
    }

    /**
     * Create an element with QCSS bindings
     * @param {string} tag - HTML tag name
     * @param {string} qcssPath - The QCSS structural path (e.g., "card title")
     * @param {Object} props - Standard DOM properties
     * @param {Array} children - Child nodes
     */
    h(tag, qcssPath, props = {}, children = []) {
        const el = document.createElement(tag);
        
        // Apply QCSS Hash
        if (qcssPath) {
            // Check manifest for hash
            const hash = this.manifest[qcssPath];
            if (hash) {
                el.setAttribute('q-id', hash);
            } else {
                // Fallback for dev mode or unhashed
                el.setAttribute('data-ref', qcssPath.split(' ').pop());
            }
        }

        // Apply props
        for (const [key, value] of Object.entries(props)) {
            if (key.startsWith('on') && typeof value === 'function') {
                el.addEventListener(key.substring(2).toLowerCase(), value);
            } else {
                el.setAttribute(key, value);
            }
        }

        // Append children
        children.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                el.appendChild(child);
            }
        });

        return el;
    }

    /**
     * Render a large list efficiently (Fragment Batching)
     * @param {HTMLElement} container 
     * @param {Array} data 
     * @param {Function} renderItem 
     */
    renderList(container, data, renderItem) {
        const fragment = document.createDocumentFragment();
        data.forEach((item, index) => {
            fragment.appendChild(renderItem(item, index));
        });
        container.innerHTML = '';
        container.appendChild(fragment);
    }
}
