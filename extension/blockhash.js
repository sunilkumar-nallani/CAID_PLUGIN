/*
 * blockhash-js
 *
 * A JavaScript implementation of the blockhash perceptual image hash.
 *
 * The MIT License (MIT)
 * Copyright (c) 2023 Leo Tacquet
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is

 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.blockhash = factory());
})(this, function() {
  'use strict';

  function blockhash(imageData, bits, method) {
    if (method !== 2 && method !== 1) {
      method = 1;
    }
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const blocksize_x = Math.floor(width / bits);
    const blocksize_y = Math.floor(height / bits);
    const result = [];
    for (let y = 0; y < bits; y++) {
      for (let x = 0; x < bits; x++) {
        let total = 0;
        for (let iy = 0; iy < blocksize_y; iy++) {
          for (let ix = 0; ix < blocksize_x; ix++) {
            const cx = x * blocksize_x + ix;
            const cy = y * blocksize_y + iy;
            const ii = (cy * width + cx) * 4;
            const alpha = data[ii + 3];
            if (alpha === 0) {
              total += 76.5;
            } else {
              const r = data[ii];
              const g = data[ii + 1];
              const b = data[ii + 2];
              total += r * 0.299 + g * 0.587 + b * 0.114;
            }
          }
        }
        result.push(total);
      }
    }
    const blocks = result;
    const bits_len = bits * bits;
    const half_bits_len = bits_len / 2;
    if (method === 1) {
      const median = blocks.slice(0).sort(function(a, b) {
        return a - b;
      })[half_bits_len];
      for (let i = 0; i < bits_len; i++) {
        result[i] = blocks[i] > median ? 1 : 0;
      }
    } else if (method === 2) {
      let medians = [];
      for (let y = 0; y < bits; y++) {
        for (let x = 0; x < bits; x++) {
          const block_pos = y * bits + x;
          const block_val = blocks[block_pos];
          let鄰 = [];
          if (x > 0) {
            鄰.push(block_pos - 1);
          }
          if (x < bits - 1) {
            鄰.push(block_pos + 1);
          }
          if (y > 0) {
            鄰.push(block_pos - bits);
          }
          if (y < bits - 1) {
            鄰.push(block_pos + bits);
          }
          let鄰_vals = [];
          for (let i = 0; i <鄰.length; i++) {
            鄰_vals.push(blocks[鄰[i]]);
          }
          const median =鄰_vals.slice(0).sort(function(a, b) {
            return a - b;
          })[Math.floor(鄰_vals.length / 2)];
          medians.push(median);
        }
      }
      for (let i = 0; i < bits_len; i++) {
        result[i] = blocks[i] > medians[i] ? 1 : 0;
      }
    }
    let hash = '';
    for (let i = 0; i < bits_len; i += 4) {
      const val = result[i] * 8 + result[i + 1] * 4 + result[i + 2] * 2 + result[i + 3];
      hash += val.toString(16);
    }
    return hash;
  }

  return blockhash;
});