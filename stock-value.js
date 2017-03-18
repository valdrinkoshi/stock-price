(doc => {
  class StockValue extends HTMLElement {

    static get is() {
      return 'stock-value';
    }

    static get observedAttributes() {
      return ['current', 'previous', 'only'];
    }

    attributeChangedCallback(name, old, value) {
      // Skip updating properties when e.g. `old = "1"` and `value = 1`
      if (old != value) {
        // Convert to number only if attribute is current or previous.
        value = name === 'only' ? value : Number(value);
        // Wait all attributes to be done changing.
        this._attributesChangingDebouncer && clearTimeout(this._attributesChangingDebouncer);
        this._attributesChangingDebouncer = setTimeout(() => {
          this._attributesChangingDebouncer = null;
          this._updateDifferencePercent();
        });
        this[name] = value;
      }
    }

    constructor() {
      super();

      /**
       * @type {number|null}
       * @private
       */
      this._attributesChangingDebouncer = null;

      /**
       * @type {!Object}
       * @private
       */
      this._props = {
        current: null,
        previous: null,
        only: null,
        difference: 0,
        percent: 0,
        formattedValue: null
      };
    }

    /** 
     * The current value.
     * @type {number|null}
     */
    get current() {
      return this._props.current;
    }

    /** 
     * @param {number|null} c
     * @returns {number|null}
     */
    set current(c) {
      // Accept null or Number.
      if (c !== null && !Number.isFinite(c)) c = null;
      if (c === this._props.current) return;
      this._props.current = c;
      this._updateDifferencePercent();
      return c;
    }

    /** 
     * The previous value.
     * @type {number|null}
     */
    get previous() {
      return this._props.previous;
    }

    /** 
     * @param {number|null} c
     * @returns {number|null}
     */
    set previous(c) {
      // Accept null or Number.
      if (c !== null && !Number.isFinite(c)) c = null;
      if (c === this._props.previous) return;
      this._props.previous = c;
      this._updateDifferencePercent();
      return c;
    }

    /** 
     * Set to 'difference' or 'percent' to change what is displayed.
     * Unset to display both (default). 
     * @type {string|null}
     */
    get only() {
      return this._props.only;
    }

    /** 
     * @param {string|null} c
     * @returns {string|null}
     */
    set only(c) {
      // Accept only 'percent' or 'difference'.
      if (c !== 'percent' && c !== 'difference') c = null;
      if (c === this._props.only) return c;
      this._props.only = c;
      this._updateFormattedValue();
      return c;
    }

    /** 
     * The difference.
     * @type {!number}
     */
    get difference() {
      return this._props.difference;
    }

    /** 
     * The difference percent.
     * @type {!number}
     */
    get percent() {
      return this._props.percent;
    }


    /** 
     * The formatted value.
     * @type {string|null}
     */
    get formattedValue() {
      return this._props.formattedValue;
    }

    /** 
     * @private
     */
    _updateDifferencePercent() {
      if (this._attributesChangingDebouncer) return;

      const cur = this.current,
        prev = this.previous,
        diff = (cur === null || prev === null) ? 0 : cur - prev;

      if (this._props.difference === diff) return;

      this._props.difference = diff;
      this._props.percent = (!diff || !prev) ? 0 : 100 * (diff / prev);

      this.dispatchEvent(new CustomEvent('difference-changed', {
        bubbles: false,
        cancelable: false,
        detail: {
          value: val
        }
      }));
      this._updateFormattedValue();
    }

    /** 
     * @private
     */
    _updateFormattedValue() {
      if (this._attributesChangingDebouncer) return;
      let fmtVal;
      switch (this.only) {
        case 'difference':
          fmtVal = this._formatNumber(this.difference);
          break;
        case 'percent':
          fmtVal = this._formatNumber(this.percent) + '%';
          break;
        default:
          fmtVal = this._formatNumber(this.difference) + ' (' + this._formatNumber(this.percent) + '%)';
          break;
      }
      if (this._props.formattedValue === fmtVal) return;
      this._props.formattedValue = this.textContent = fmtVal;
      this.dispatchEvent(new CustomEvent('formatted-value-changed', {
        bubbles: false,
        cancelable: false,
        detail: {
          value: val
        }
      }));
    }

    /** 
     * @param {!number} num
     * @private
     */
    _formatNumber(num) {
      return (num > 0 ? '+' : '') + num.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: Math.abs(num * 100) < 1 ? 4 : 2
      });
    }
  }
  customElements.define(StockValue.is, StockValue);
})(document.currentScript.ownerDocument);