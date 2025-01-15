class LazyLoad {
  #observer = null;
  #options = null;

  constructor() { this.config(); }

  
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
    if(isValidDOM === false) throw new Error('"root" must be a valid DOM element!');

    if (loadBefore === null || loadBefore === undefined || typeof loadBefore !== 'number' || loadBefore < 0) {
      throw new Error('"loadBefore" must be a positive number!');
    }

    if (loadAfter === null || loadAfter === undefined || typeof loadAfter !== 'number' || loadAfter < 0) {
      throw new Error('"loadAfter" must be a positive number!');
    }

    // Observer Options
    this.#options = {
      root, // Observe with respect to the viewport
      rootMargin: `${loadBefore}px`, // Trigger {rootMargin}px before the element fully enters the viewport
      threshold: loadAfter, // Trigger when {threshold}% of the element is visible
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
  loadImage({ selector = null, images = [] } = {}) {
    const isValidSelector = this.#checkValidCSSSelector(selector);
    if (selector === null || selector === undefined || typeof selector !== 'string' || isValidSelector === false) {
      throw new Error('"selector" is required and must be a valid CSS selector');
    }

    this.#observer = new IntersectionObserver(this.#renderImage, this.#options);

    const elements = document.querySelectorAll(selector);

    if (Array.isArray(images) === true) {
      if (images.length) {
        for (let i = 0; i < elements.length; i++) {
          if (typeof images[i] !== 'string') throw new Error('Image path must be a string');
          else elements[i].dataset.imageUrl = images[i];
        }
      }
    }
    else throw new Error('"images" must be an array of string!');

    elements.forEach(elem => { this.#observer.observe(elem); })
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
  #renderImage(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;

        const path = img.dataset.imageUrl || null
        if (path) img.src = path;

        observer.unobserve(img); // Stop observing this image
      }
    });
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
  executeFn({ selector = null, exeFn = null } = {}) {
    const isValidSelector = this.#checkValidCSSSelector(selector);
    if (selector === null || selector === undefined || typeof selector !== 'string' || isValidSelector === false) {
      throw new Error('"selector" is required and must be a valid CSS selector');
    }

    if (selector === null || selector === undefined || typeof exeFn !== 'function') {
      throw new Error('"exeFn" must be a function');
    }

    this.#observer = new IntersectionObserver(this.#handleFunctionExecution(exeFn), this.#options);

    const element = document.querySelector(selector);
    this.#observer.observe(element)
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

          observer.unobserve(entry.target); // Stop observing this element
        }
      });
    }
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