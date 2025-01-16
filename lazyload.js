class LazyLoad {
  #observer = null;
  #options = null;

  constructor() {
    this.config();
  }

  /**
   * Configures the observer options.
   * @param {Object} [options] - Observer options.
   * @param {Element} [options.root] - The element that is used as
   *   the viewport for checking visibility of the target. Must be the
   *   ancestor of the target. Defaults to the browser viewport if not
   *   specified or if null.
   * @param {number} [options.loadBefore] - Margin around the root. If
   *   the root is null, this value is ignored. Can have values similar
   *   to the CSS margin property, e.g. "10px 20px 30px 40px" (top, right,
   *   bottom, left). The values can be percentages. This set of values
   *   serves as a shorthand for setting the individual properties.
   *   Defaults to 0 if not specified or if null.
   * @param {number|number[]} [options.loadAfter] - A single number
   *   between 0 and 1.0 which indicates at what percentage of the
   *   target's visibility the observer will trigger. Can also be an
   *   array of numbers. The callback will be called whenever the
   *   visibility of the target passes one of the values in the array.
   *   Defaults to 0 if not specified or if null.
   */
  config({ root = null, loadBefore = 0, loadAfter = 0 } = {}) {
    let isValidDOM = true;
    if (root !== null) isValidDOM = this.checkValidDOMElement(root);
    if(isValidDOM === false) throw new Error('Failed to construct "LazyLoad": "root" must be a valid DOM element!');

    if (loadBefore === null || loadBefore === undefined || typeof loadBefore !== 'number' || loadBefore < 0) {
      throw new Error('Failed to construct "LazyLoad": "loadBefore" must be a positive number!');
    }

    if (loadAfter === null || loadAfter === undefined || typeof loadAfter !== 'number' || loadAfter < 0 || loadAfter > 1) {
      throw new Error('Failed to construct "LazyLoad": "loadAfter" must be a number between 0 and 1!');
    }

    // Observer Options
    this.#options = {
      root, // The element that is used as the viewport for checking visibility
      rootMargin: `${loadBefore}px`, // Trigger {loadBefore}px before the element fully enters the viewport
      threshold: loadAfter, // Trigger when {loadAfter}% of the element is visible
    };
  }

  /**
   * Loads an image lazily when the element containing the image
   * comes into view.
   * @param {Object} [options] - Options for the lazy load.
   * @param {string} [options.selector] - The CSS selector to target
   *   elements for lazy loading. The selector must be a valid
   *   CSS selector. If not specified, an error is thrown.
   * @param {string[]} [options.images] - An array of strings where each
   *   string is a path to an image. If the array is empty, the image
   *   will be loaded from the value of the `data-path` attribute of the
   *   element. If the array is not empty, the image path is set to the
   *   first element of the array. If the element of the array is not a
   *   string, an error is thrown.
   */
  loadImage({ selector = null, srcTarget = null, attr = null, images = [], root = null, loadBefore = 0, loadAfter = 0 } = {}) {
    if (typeof selector !== "string" || this.#checkValidCSSSelector(selector) === false) {
      throw new Error('Failed to construct "LazyLoad": "selector" is required and must be a valid CSS selector');
    }

    if (srcTarget !== null) {
      if (typeof srcTarget !== "string" || this.#checkValidCSSSelector(srcTarget) === false) {
        throw new Error('Failed to construct "LazyLoad": "srcTarget" is must be a valid CSS selector or null');
      }
    }

    if (attr !== null) {
      if (attr === undefined || typeof attr !== 'string') {
        throw new Error('Failed to construct "LazyLoad": "attr" is must be a string or null');
      }
    }

    if(root !== null || loadBefore !== 0 || loadAfter !== 0) this.config({root, loadBefore, loadAfter });

    this.#observer = new IntersectionObserver(this.#renderImage(srcTarget, attr), this.#options);

    const elements = document.querySelectorAll(selector);

    if (Array.isArray(images) === true) {
      if (images.length) {
        for (let i = 0; i < images.length; i++) {
          if (typeof images[i] !== 'string') throw new Error('Failed to construct "LazyLoad": Image path must be a string');
          else elements[i].dataset.imageUrl = images[i];
        }
      }
    }
    else throw new Error('Failed to construct "LazyLoad": "images" must be an array of string!');

    elements.forEach(elem => { this.#observer.observe(elem); });
  }


  /**
   * Callback function for the IntersectionObserver that is called
   * when an element (i.e. an image) comes into view.
   * @param {IntersectionObserverEntry[]} entries - An array of
   *   IntersectionObserverEntry objects that represent the elements
   *   that have come into view.
   * @param {IntersectionObserver} observer - The IntersectionObserver
   *   that is watching the elements.
   */
  #renderImage(srcTarget, attr) {
    return (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const elem = entry.target;
          const path = elem.dataset.imageUrl || null;

          if (path) {
            if (srcTarget) {
              let srcElem = elem.querySelector(srcTarget)
              attr ? srcElem.setAttribute(attr, path) : srcElem.src = path
            }
            else attr ? elem.setAttribute(attr, path) : elem.src = path;
          }

          observer.unobserve(elem);
        }
      });
    }
  }

  /**
   * Loads a video lazily when the element containing the video
   * comes into view.
   * @param {Object} [options] - Options for the lazy load.
   * @param {string} [options.selector] - The CSS selector to target
   *   elements for lazy loading. The selector must be a valid
   *   CSS selector. If not specified, an error is thrown.
   * @param {string[]} [options.videos] - An array of strings where each
   *   string is a path to a video. If the array is empty, the video
   *   will be loaded from the value of the `data-path` attribute of the
   *   element. If the array is not empty, the video path is set to the
   *   first element of the array. If the element of the array is not a
   *   string, an error is thrown.
   */
  loadVideo({ selector = null, srcTarget = null, attr = null, videos = [], root = null, loadBefore = 0, loadAfter = 0 } = {}) {
    if (typeof selector !== "string" || this.#checkValidCSSSelector(selector) === false) {
      throw new Error('Failed to construct "LazyLoad": "selector" is required and must be a valid CSS selector');
    }

    if (srcTarget !== null) {
      if (typeof srcTarget !== "string" || this.#checkValidCSSSelector(srcTarget) === false) {
        throw new Error('Failed to construct "LazyLoad": "srcTarget" is must be a valid CSS selector or null');
      }
    }

    if (attr !== null) {
      if (attr === undefined || typeof attr !== 'string') {
        throw new Error('Failed to construct "LazyLoad": "attr" is must be a string or null');
      }
    }

    if(root !== null || loadBefore !== 0 || loadAfter !== 0) this.config({root, loadBefore, loadAfter });

    this.#observer = new IntersectionObserver(this.#renderVideo(srcTarget, attr), this.#options);

    const elements = document.querySelectorAll(selector);

    if (Array.isArray(videos) === true) {
      if (videos.length) {
        for (let i = 0; i < videos.length; i++) {
          if (typeof videos[i] !== 'string') throw new Error('Failed to construct "LazyLoad": Video path must be a string');
          else elements[i].dataset.videoUrl = videos[i];
        }
      }
    }
    else throw new Error('Failed to construct "LazyLoad": "videos" must be an array of string!');

    elements.forEach(elem => { this.#observer.observe(elem); });
  }

  /**
   * The callback for IntersectionObserver when the video element enters the viewport.
   * @param {string} [srcTarget] - The CSS selector of the element which holds the video path.
   *   If null, the video path is set to the element itself.
   * @param {string} [attr] - The attribute name of the element which holds the video path.
   *   If null, the video path is set to the src attribute of the element.
   * @returns {(entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void} - The callback function for IntersectionObserver.
   */
  #renderVideo(srcTarget, attr) {
    return (entries, observer) => {
      entries.forEach(entry => {
      if (entry.isIntersecting) {
        const elem = entry.target;
        const path = elem.dataset.videoUrl || null;

        if (path) {
          if (srcTarget) {
            let srcElem = elem.querySelector(srcTarget)
            attr ? srcElem.setAttribute(attr, path) : srcElem.src = path
          }
          else attr ? elem.setAttribute(attr, path) : elem.src = path;
        }

        observer.unobserve(elem);
      }
    });
    }
  }

  /**
   * Executes a function lazily when the element containing the
   * selector comes into view.
   * @param {Object} [options] - Options for the lazy load.
   * @param {string} [options.selector] - The CSS selector to target
   *   elements for lazy loading. The selector must be a valid
   *   CSS selector. If not specified, an error is thrown.
   * @param {function} [options.exeFn] - The function to execute when
   *   the element containing the selector comes into view. The
   *   function must be a function. If not specified, an error is thrown.
   */
  executeFn({ selector = null, exeFn = null, root = null, loadBefore = 0, loadAfter = 0 } = {}) {
    if (typeof selector !== "string" || this.#checkValidCSSSelector(selector) === false) {
      throw new Error('Failed to construct "LazyLoad": "selector" is required and must be a valid CSS selector');
    }

    if (typeof exeFn !== 'function') {
      throw new Error('Failed to construct "LazyLoad": "exeFn" must be a function');
    }

    if(root !== null || loadBefore !== 0 || loadAfter !== 0) this.config({root, loadBefore, loadAfter });

    this.#observer = new IntersectionObserver(this.#handleFunctionExecution(exeFn), this.#options);

    const element = document.querySelector(selector);
    this.#observer.observe(element);
  }

  /**
   * Returns a callback function to be used with IntersectionObserver
   * which executes the provided function when the observed element
   * is in view, and then stops observing it.
   * 
   * @param {function} exeFn - The function to execute when the element
   *   containing the selector comes into view. The function must be a
   *   function.
   * @returns {function} - A callback function for IntersectionObserver
   *   that handles intersection changes and executes the provided
   *   function when the element is in view.
   */
  #handleFunctionExecution(exeFn) {
    return (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          exeFn();

          observer.unobserve(entry.target);
        }
      });
    }
  }

  /**
   * Destroys the lazy load observer by disconnecting it and resetting the configuration.
   * This stops observing any elements for lazy loading.
   */
  destroy() {
    this.config();
    this.#observer.disconnect();
  }

  /**
   * Checks if the provided DOM element is valid or not.
   * @param {Element} element - The element to check.
   * @returns {boolean} - True if the element is valid, false if not.
   */
  checkValidDOMElement(element) {
    if (element && element instanceof Element && element.nodeType === 1) return true;
    else return false;
  }

  /**
   * Checks if the provided CSS selector is valid.
   * @param {string} selector - The CSS selector to check.
   * @returns {boolean} - True if the selector is valid, false if not.
   */
  #checkValidCSSSelector(selector) {
    const checkSelector = document.querySelector(selector) || null;

    if (checkSelector) return true;
    else return false;
  }
}

export { LazyLoad };