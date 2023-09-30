// ==UserScript==
// @name         PsStoreEditionLink
// @namespace    https://github.com/rod24574575
// @description  Add hyperlink to the other editions in playstation store
// @version      0.2.0
// @license      MIT
// @author       rod24574575
// @homepage     https://github.com/rod24574575/PsStoreEditionLink
// @homepageURL  https://github.com/rod24574575/PsStoreEditionLink
// @supportURL   https://github.com/rod24574575/PsStoreEditionLink/issues
// @updateURL    https://gist.github.com/rod24574575/23c88840b5c14d6bc5c61c5836a01db1/raw/PsStoreEditionLink.user.js
// @downloadURL  https://gist.github.com/rod24574575/23c88840b5c14d6bc5c61c5836a01db1/raw/PsStoreEditionLink.user.js
// @match        *://*.store.playstation.com/*
// @run-at       document-idle
// ==/UserScript==

// @ts-check

(function() {
  function run() {
    /**
     * @param {string} trackString
     * @returns {string | null}
     */
    function findSkuId(trackString) {
      /** @type {string} */
      let rawSku;
      try {
        const track = JSON.parse(trackString);
        if (!track || typeof track !== 'object') {
          return null;
        }

        const sku = track?.attributes?.sku;
        if (typeof sku !== 'string') {
          return null;
        }

        rawSku = sku;
      } catch {
        return null;
      }

      const lastDashIndex = rawSku.lastIndexOf('-');
      if (lastDashIndex < 0) {
        return null;
      }

      return rawSku.slice(0, lastDashIndex);
    }

    /**
     * @param {string} id
     * @returns {string}
     */
    function createProductUrl(id) {
      const href = location.href;

      const pattern = '/product/';
      const productStringIndex = href.indexOf(pattern);
      if (productStringIndex < 0) {
        return '';
      }
      return href.slice(0, productStringIndex + pattern.length) + id;
    }

    for (const productEditionEl of document.querySelectorAll('article[data-qa^="mfeUpsell#productEdition"]')) {
      const editorTitleEl = productEditionEl.querySelector('[data-qa*="editionName"]')?.parentElement;
      if (!editorTitleEl) {
        continue;
      }

      const parent = editorTitleEl.parentElement;
      if (!parent) {
        continue;
      }

      const addCartEl = productEditionEl.querySelector('button[data-track]');
      if (!addCartEl) {
        continue;
      }

      const skuId = findSkuId(addCartEl.getAttribute('data-track') ?? '');
      if (!skuId) {
        continue;
      }

      const anchor = document.createElement('a');
      anchor.href = createProductUrl(skuId);
      Object.assign(anchor.style, {
        display: 'block',
      });

      parent.insertBefore(anchor, editorTitleEl);
      anchor.appendChild(editorTitleEl);
    }
  }

  /** @type {number | undefined} */
  let timer = window.setInterval(() => {
    if (!document.querySelector('[data-qa="mfeUpsell"]:not([data-reactroot])')) {
      return;
    }

    run();
    window.clearInterval(timer);
    timer = undefined;
  }, 100);
})();
