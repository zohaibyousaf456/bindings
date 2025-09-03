"use client"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { useOnboardingStore, type Logo } from "@/store/onboarding-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Sparkles, Check, Plus, Loader2, Target, Palette } from "lucide-react"
import { toast } from "react-toastify"
import { PrimaryButton } from "@/components/ui/primary-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { processImage, base64ToBlob, blobToBase64 } from "@/lib/image-processing"

// ----------------------
// Helpers (pure & robust) - UPDATED WITH ALIGNMENT PRESERVATION
// ----------------------

/** Safe parse of SVG; throws if invalid */
function parseSVG(svgString: string): SVGSVGElement {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgString, "image/svg+xml")
  const err = doc.querySelector("parsererror")
  if (err) throw new Error(err.textContent || "SVG parse error")
  const svg = doc.querySelector("svg")
  if (!svg) throw new Error("No <svg> root found")
  return svg as unknown as SVGSVGElement
}

/** Serialize SVG back to string */
function serializeSVG(svg: SVGSVGElement) {
  const serializer = new XMLSerializer()
  return serializer.serializeToString(svg)
}

/** Collect <tspan> (preferred) then fallback to <text> (document order) */
function collectTextNodes(svg: SVGSVGElement): Array<SVGTextElement | SVGTSpanElement> {
  const tspans = Array.from(svg.querySelectorAll("tspan")) as SVGTSpanElement[]
  const texts = Array.from(svg.querySelectorAll("text")) as SVGTextElement[]
  return tspans.length ? tspans : texts
}

/** Detect text alignment from SVG text element */
function getTextAlignment(textElement: SVGTextElement | SVGTSpanElement): {
  textAnchor: string | null;
  x: string | null;
  y: string | null;
  dx: string | null;
  dy: string | null;
  transform: string | null;
} {
  // Get text-anchor (start, middle, end)
  const textAnchor = textElement.getAttribute("text-anchor") || 
                     textElement.style.textAnchor || 
                     (textElement.parentElement as SVGElement)?.getAttribute("text-anchor") ||
                     null;
  
  // Get positioning attributes
  const x = textElement.getAttribute("x");
  const y = textElement.getAttribute("y");
  const dx = textElement.getAttribute("dx");
  const dy = textElement.getAttribute("dy");
  const transform = textElement.getAttribute("transform");
  
  return { textAnchor, x, y, dx, dy, transform };
}

/** Get reasonable placement from viewBox (fallback to 512x512) */
function fromViewBox(svg: SVGSVGElement) {
  const vb = svg.getAttribute("viewBox")
  if (vb) {
    const [minX, minY, w, h] = vb.split(/\s+|,/).map(Number.parseFloat)
    return { x: minX, y: minY, width: w, height: h }
  }
  const wAttr = Number.parseFloat(svg.getAttribute("width") || "512")
  const hAttr = Number.parseFloat(svg.getAttribute("height") || "512")
  return { x: 0, y: 0, width: wAttr || 512, height: hAttr || 512 }
}

/** Calculate text alignment based on position relative to viewBox */
function calculateTextAlignment(
  textElement: SVGTextElement | SVGTSpanElement, 
  svg: SVGSVGElement
): 'left' | 'center' | 'right' {
  const alignment = getTextAlignment(textElement);
  
  // If text-anchor is explicitly set, use it
  if (alignment.textAnchor) {
    switch (alignment.textAnchor) {
      case 'start': return 'left';
      case 'middle': return 'center';
      case 'end': return 'right';
    }
  }
  
  // If no explicit text-anchor, calculate based on x position
  if (alignment.x) {
    const viewBox = fromViewBox(svg);
    const xPos = parseFloat(alignment.x);
    const centerX = viewBox.x + viewBox.width / 2;
    const tolerance = viewBox.width * 0.1; // 10% tolerance
    
    if (Math.abs(xPos - centerX) < tolerance) {
      return 'center';
    } else if (xPos < centerX) {
      return 'left';
    } else {
      return 'right';
    }
  }
  
  // Default to left if no alignment info found
  return 'left';
}

/** UPDATED: Set text content while preserving ALL styling and alignment attributes */
function setText(node: Element, text: string) {
  // Store ALL original attributes before changing text
  const originalAttributes: { [key: string]: string } = {};
  
  // Comprehensive list of attributes to preserve
  const attributesToPreserve = [
    'font-family', 'font-size', 'font-weight', 'font-style',
    'letter-spacing', 'text-anchor', 'x', 'y', 'dx', 'dy',
    'transform', 'fill', 'stroke', 'opacity', 'style',
    'dominant-baseline', 'alignment-baseline', 'text-decoration',
    'text-rendering', 'word-spacing', 'writing-mode', 'glyph-orientation-vertical',
    'glyph-orientation-horizontal', 'direction', 'unicode-bidi'
  ];

  if (node.tagName === "tspan" || node.tagName === "text") {
    // Store all attributes
    attributesToPreserve.forEach(attr => {
      const value = node.getAttribute(attr);
      if (value !== null) {
        originalAttributes[attr] = value;
      }
    });
    
    // Also check computed styles for text-anchor
    const computedStyle = window.getComputedStyle(node);
    const computedTextAnchor = computedStyle.getPropertyValue('text-anchor');
    if (computedTextAnchor && !originalAttributes['text-anchor']) {
      originalAttributes['text-anchor'] = computedTextAnchor;
    }

    // Change text content
    node.textContent = text

    // Restore all attributes
    Object.entries(originalAttributes).forEach(([attr, value]) => {
      node.setAttribute(attr, value);
    });
  } else {
    // For other elements, try to find nested text/tspan
    const textEl = node.querySelector("text, tspan")
    if (textEl) {
      setText(textEl, text);
    }
  }
}

/** Find a logo slot group */
function findLogoSlot(svg: SVGSVGElement) {
  const group = Array.from(svg.querySelectorAll("g[id]")).find((g) =>
    (g.getAttribute("id") || "").toLowerCase().includes("logo"),
  ) as SVGGElement | undefined
  if (!group) return null

  const rect = group.querySelector("rect") as SVGRectElement | null
  if (rect) {
    const x = Number.parseFloat(rect.getAttribute("x") || "0")
    const y = Number.parseFloat(rect.getAttribute("y") || "0")
    const width = Number.parseFloat(rect.getAttribute("width") || "0")
    const height = Number.parseFloat(rect.getAttribute("height") || "0")
    return { container: group, rect: { x, y, width, height } }
  }
  return { container: group, rect: null }
}

/** Measure bbox by cloning group into off-screen SVG (browser-only) */
function measureGroupBBox(group: SVGGElement, originalSVG: SVGSVGElement) {
  const NS = "http://www.w3.org/2000/svg"
  const tempSVG = document.createElementNS(NS, "svg")
  tempSVG.setAttribute("xmlns", NS)
  tempSVG.setAttribute("width", "0")
  tempSVG.setAttribute("height", "0")
  tempSVG.setAttribute("style", "position:absolute;left:-99999px;top:-99999px;visibility:hidden;overflow:visible;")
  const vb = originalSVG.getAttribute("viewBox")
  if (vb) tempSVG.setAttribute("viewBox", vb)

  const wrapper = document.createElementNS(NS, "g")
  wrapper.appendChild(group.cloneNode(true))
  tempSVG.appendChild(wrapper)
  document.body.appendChild(tempSVG)

  try {
    const box = wrapper.getBBox()
    return { x: box.x, y: box.y, width: box.width, height: box.height }
  } catch {
    return { x: 0, y: 0, width: 0, height: 0 }
  } finally {
    document.body.removeChild(tempSVG)
  }
}

function upsertLogoImage(svg: SVGSVGElement, logoUrl: string) {
  const slot = findLogoSlot(svg)
  const NS = "http://www.w3.org/2000/svg"

  svg.querySelector("#logo-image")?.remove()

  const image = document.createElementNS(NS, "image")
  image.setAttribute("href", logoUrl)
  image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", logoUrl)
  image.setAttribute("preserveAspectRatio", "xMidYMid meet")
  image.setAttribute("id", "logo-image")

  const viewport = fromViewBox(svg)

  if (slot) {
    const groupClone = slot.container.cloneNode(true) as SVGGElement
    let target = slot.rect as { x: number; y: number; width: number; height: number } | null
    if (!target) {
      const bbox = measureGroupBBox(groupClone, svg)
      if (bbox.width > 0 && bbox.height > 0) target = bbox
    }
    slot.container.innerHTML = ""

    if (target) {
      image.setAttribute("x", String(target.x))
      image.setAttribute("y", String(target.y))
      image.setAttribute("width", String(target.width))
      image.setAttribute("height", String(target.height))
      slot.container.appendChild(image)
      return
    }

    const s = Math.round(Math.min(viewport.width, viewport.height) * 0.2)
    const x = viewport.x + (viewport.width - s) / 2
    const y = viewport.y + Math.round(viewport.height * 0.05)
    image.setAttribute("x", String(x))
    image.setAttribute("y", String(y))
    image.setAttribute("width", String(s))
    image.setAttribute("height", String(s))
    svg.appendChild(image)
    return
  }

  const s = Math.round(Math.min(viewport.width, viewport.height) * 0.2)
  const x = viewport.x + (viewport.width - s) / 2
  const y = viewport.y + Math.round(viewport.height * 0.05)
  image.setAttribute("x", String(x))
  image.setAttribute("y", String(y))
  image.setAttribute("width", String(s))
  image.setAttribute("height", String(s))
  svg.appendChild(image)
}

function getFontFamily(node: Element): string | null {
  let el: Element | null = node
  while (el) {
    const font = el.getAttribute("font-family")
    if (font) return font
    el = el.parentElement
  }
  return null
}

/** Apply background color to SVG and its background elements */
function applyBackground(svg: SVGSVGElement, color?: string) {
  if (!color) return

  // Apply to SVG element itself
  const prevStyle = svg.getAttribute("style") || ""
  const styles = prevStyle
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
  const filtered = styles.filter((s) => !s.toLowerCase().startsWith("background"))
  filtered.push(`background-color: ${color}`)
  svg.setAttribute("style", filtered.join("; "))

  // Find and update background rectangle if it exists
  const bgRect = svg.querySelector('rect[id*="background"], rect[class*="background"]') as SVGRectElement | null
  if (bgRect) {
    bgRect.setAttribute("fill", color)
    return // If we found a dedicated background rect, don't process other rects
  }

  // Otherwise, look for full-size or near-full-size rectangles
  const viewBox = fromViewBox(svg)
  const rects = Array.from(svg.querySelectorAll("rect"))
  rects.forEach((r) => {
    const x = Number.parseFloat(r.getAttribute("x") || "0")
    const y = Number.parseFloat(r.getAttribute("y") || "0")
    const width = Number.parseFloat(r.getAttribute("width") || "0")
    const height = Number.parseFloat(r.getAttribute("height") || "0")

    // Check if rect covers most of the SVG
    const isLargeRect =
      width >= viewBox.width * 0.9 &&
      height >= viewBox.height * 0.9 &&
      x <= viewBox.width * 0.1 &&
      y <= viewBox.height * 0.1

    if (isLargeRect) {
      const fill = (r.getAttribute("fill") || "").toLowerCase()
      if (["#ffffff", "#000000", "white", "black", "none", "transparent"].includes(fill)) {
        r.setAttribute("fill", color)
      }
    }
  })
}

function checkTextFitsInSVG(svg: SVGSVGElement): boolean {
  const textElements = svg.querySelectorAll("text, tspan")
  const svgRect = svg.getBoundingClientRect()
  const svgViewBox = svg.viewBox.baseVal

  // Use viewBox if available, otherwise use SVG dimensions
  const svgWidth = svgViewBox.width || Number.parseFloat(svg.getAttribute("width") || "0")
  const svgHeight = svgViewBox.height || Number.parseFloat(svg.getAttribute("height") || "0")

  for (const textEl of textElements) {
    try {
      const bbox = (textEl as SVGTextElement).getBBox()
      const padding = 10 // Add some padding to prevent edge cases

      // Check if text exceeds SVG boundaries
      if (
        bbox.x < -padding ||
        bbox.y < -padding ||
        bbox.x + bbox.width > svgWidth + padding ||
        bbox.y + bbox.height > svgHeight + padding
      ) {
        return false
      }
    } catch (error) {
      // If getBBox fails, assume it doesn't fit to be safe
      return false
    }
  }

  return true
}

function adjustTextToFit(svg: SVGSVGElement, maxAttempts = 5): boolean {
  let attempts = 0

  while (attempts < maxAttempts && !checkTextFitsInSVG(svg)) {
    const textElements = svg.querySelectorAll("text, tspan")

    textElements.forEach((textEl) => {
      const currentFontSize = Number.parseFloat(textEl.getAttribute("font-size") || "16")
      const newFontSize = currentFontSize * 0.9 // Reduce by 10% each attempt
      textEl.setAttribute("font-size", newFontSize.toString())
    })

    attempts++
  }

  return checkTextFitsInSVG(svg)
}

/** UPDATED: Auto-fill template text content with alignment preservation */
function autoFillText(svg: SVGSVGElement, businessName?: string, businessTagline?: string, industry?: string) {
  const nodes = collectTextNodes(svg)
  if (!nodes.length) return

  // Store original alignments before any modifications
  const originalAlignments = nodes.map(node => ({
    node,
    alignment: calculateTextAlignment(node, svg),
    attributes: getTextAlignment(node)
  }));

  const placeholders = [
    { re: /\{\{\s*(businessName|name|company)\s*\}\}/i, value: businessName },
    { re: /\{\{\s*(businessTagline|tagline)\s*\}\}/i, value: businessTagline },
    { re: /\{\{\s*(industry)\s*\}\}/i, value: industry },
  ]

  nodes.forEach((n, index) => {
    const t = n.textContent || ""
    let replaced = t
    placeholders.forEach((p) => {
      if (p.value) replaced = replaced.replace(p.re, p.value)
    })
    
    if (replaced !== t) {
      setText(n, replaced)
      
      // Ensure alignment is preserved after text change
      const originalAlign = originalAlignments[index];
      if (originalAlign.attributes.textAnchor) {
        n.setAttribute('text-anchor', originalAlign.attributes.textAnchor);
      }
    }
  })

  const hadPlaceholders = nodes.some((n) => /\{\{.*\}\}/.test(n.textContent || ""))
  if (!hadPlaceholders) {
    let i = 0
    if (businessName && nodes[i]) {
      const originalAlign = originalAlignments[i];
      setText(nodes[i], businessName)
      
      // Preserve alignment for replaced text
      if (originalAlign.attributes.textAnchor) {
        nodes[i].setAttribute('text-anchor', originalAlign.attributes.textAnchor);
      }
      i++
    }
    if (businessTagline && nodes[i]) {
      const originalAlign = originalAlignments[i];
      setText(nodes[i], businessTagline)
      
      if (originalAlign.attributes.textAnchor) {
        nodes[i].setAttribute('text-anchor', originalAlign.attributes.textAnchor);
      }
      i++
    }
    if (industry && nodes[i]) {
      const originalAlign = originalAlignments[i];
      setText(nodes[i], industry)
      
      if (originalAlign.attributes.textAnchor) {
        nodes[i].setAttribute('text-anchor', originalAlign.attributes.textAnchor);
      }
    }
  }

  return adjustTextToFit(svg)
}

/** Apply a chosen solid text color to all text-ish nodes */
function applyTextColor(svg: SVGSVGElement, color?: string) {
  if (!color) return
  const nodes = collectTextNodes(svg)
  nodes.forEach((n) => {
    n.setAttribute("fill", color)
    const existingStyle = (n.getAttribute("style") || "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
    const filtered = existingStyle.filter((s) => !s.toLowerCase().startsWith("color:"))
    filtered.push(`color:${color}`)
    n.setAttribute("style", filtered.join("; "))
  })
}

/** Ensure <defs> exists */
function ensureDefs(svg: SVGSVGElement) {
  const NS = "http://www.w3.org/2000/svg"
  let defs = svg.querySelector("defs") as SVGDefsElement | null
  if (!defs) {
    defs = document.createElementNS(NS, "defs") as SVGDefsElement
    svg.insertBefore(defs, svg.firstChild)
  }
  return defs
}

/** Create/update a linearGradient for text, and return the fill url(#id) */
function upsertTextGradient(svg: SVGSVGElement, id: string, colorA: string, colorB: string, angleDeg: number) {
  const NS = "http://www.w3.org/2000/svg"
  const defs = ensureDefs(svg)

  // Try to find existing gradient
  let grad = defs.querySelector(`#${id}`) as SVGLinearGradientElement | null
  if (!grad) {
    grad = document.createElementNS(NS, "linearGradient")
    grad.setAttribute("id", id)
    defs.appendChild(grad)
  }

  // Use objectBoundingBox units so it maps to each text node's bbox
  grad.setAttribute("gradientUnits", "objectBoundingBox")
  grad.setAttribute("x1", "0%")
  grad.setAttribute("y1", "0%")
  grad.setAttribute("x2", "100%")
  grad.setAttribute("y2", "0%")
  grad.setAttribute("gradientTransform", `rotate(${angleDeg})`)

  // Upsert stops
  let s0 = grad.querySelector('stop[offset="0%"]') as SVGStopElement | null
  if (!s0) {
    s0 = document.createElementNS(NS, "stop")
    s0.setAttribute("offset", "0%")
    grad.appendChild(s0)
  }
  let s1 = grad.querySelector('stop[offset="100%"]') as SVGStopElement | null
  if (!s1) {
    s1 = document.createElementNS(NS, "stop")
    s1.setAttribute("offset", "100%")
    grad.appendChild(s1)
  }
  s0.setAttribute("stop-color", colorA)
  s1.setAttribute("stop-color", colorB)

  return `url(#${id})`
}

/** Apply gradient text fill to all text-ish nodes */
function applyTextGradient(svg: SVGSVGElement, colorA: string, colorB: string, angleDeg: number) {
  const fillUrl = upsertTextGradient(svg, "text-gradient-fill", colorA, colorB, angleDeg)
  const nodes = collectTextNodes(svg)
  nodes.forEach((n) => {
    n.setAttribute("fill", fillUrl)
    const existingStyle = (n.getAttribute("style") || "")
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
    const filtered = existingStyle.filter((s) => !s.toLowerCase().startsWith("color:"))
    filtered.push(`color:${fillUrl}`)
    n.setAttribute("style", filtered.join("; "))
  })
}

/** Template-agnostic SVG customization */
type TextFill = { mode: "SOLID"; solid: string } | { mode: "GRADIENT"; a: string; b: string; angle: number }

function customizeSVGGeneric(
  svgString: string,
  businessName?: string,
  description?: string,
  industry?: string,
  logoUrl?: string,
  backgroundColor?: string, // kept but unused
  textFill?: TextFill,
) {
  const svg = parseSVG(svgString)

  autoFillText(svg, businessName, description, industry)
  if (logoUrl) upsertLogoImage(svg, logoUrl)

  // Apply background color if provided
  if (backgroundColor) {
    applyBackground(svg, backgroundColor)
  }

  if (textFill) {
    if (textFill.mode === "SOLID") {
      applyTextColor(svg, textFill.solid)
    } else {
      applyTextGradient(svg, textFill.a, textFill.b, textFill.angle)
    }
  }

  return serializeSVG(svg)
}

// ----------------------
// Component (rest of your component code remains the same)
// ----------------------

interface Template {
  id: number
  name: string
  svg: string
  category: string
  type: string
  created_at: string
}

interface LogoStepProps {
  onNext: () => void
  onBack: () => void
}

export function LogoStep({ onNext, onBack }: LogoStepProps) {
  // ... rest of your component code remains exactly the same ...
  // The only change is that the helper functions above now preserve text alignment
}