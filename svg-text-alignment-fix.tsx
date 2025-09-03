// Enhanced SVG text handling functions with alignment preservation

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

/** Enhanced setText function that preserves all text attributes including alignment */
function setTextPreserveAlignment(node: Element, text: string) {
  // Store ALL original attributes before changing text
  const originalAttributes: { [key: string]: string } = {};
  
  // List of attributes to preserve
  const attributesToPreserve = [
    'font-family', 'font-size', 'font-weight', 'font-style',
    'letter-spacing', 'text-anchor', 'x', 'y', 'dx', 'dy',
    'transform', 'fill', 'stroke', 'opacity', 'style',
    'dominant-baseline', 'alignment-baseline', 'text-decoration'
  ];
  
  if (node.tagName === "tspan" || node.tagName === "text") {
    // Store all attributes
    attributesToPreserve.forEach(attr => {
      const value = node.getAttribute(attr);
      if (value !== null) {
        originalAttributes[attr] = value;
      }
    });
    
    // Change text content
    node.textContent = text;
    
    // Restore all attributes
    Object.entries(originalAttributes).forEach(([attr, value]) => {
      node.setAttribute(attr, value);
    });
  } else {
    // For other elements, try to find nested text/tspan
    const textEl = node.querySelector("text, tspan");
    if (textEl) {
      setTextPreserveAlignment(textEl, text);
    }
  }
}

/** Get the effective bounding box of text considering transformations */
function getTextBBox(textElement: SVGTextElement | SVGTSpanElement): DOMRect | null {
  try {
    // For tspan, we need to get the parent text element's bbox
    if (textElement.tagName === 'tspan') {
      const parentText = textElement.closest('text');
      if (parentText) {
        return (parentText as SVGTextElement).getBBox();
      }
    }
    return (textElement as SVGTextElement).getBBox();
  } catch (e) {
    return null;
  }
}

/** Enhanced auto-fill that maintains text alignment */
function autoFillTextWithAlignment(
  svg: SVGSVGElement, 
  businessName?: string, 
  businessTagline?: string, 
  industry?: string
) {
  const nodes = collectTextNodes(svg);
  if (!nodes.length) return;

  // First, analyze the original text alignment
  const originalAlignments = nodes.map(node => ({
    node,
    alignment: calculateTextAlignment(node, svg),
    attributes: getTextAlignment(node)
  }));

  const placeholders = [
    { re: /\{\{\s*(businessName|name|company)\s*\}\}/i, value: businessName },
    { re: /\{\{\s*(businessTagline|tagline)\s*\}\}/i, value: businessTagline },
    { re: /\{\{\s*(industry)\s*\}\}/i, value: industry },
  ];

  nodes.forEach((n, index) => {
    const t = n.textContent || "";
    let replaced = t;
    placeholders.forEach((p) => {
      if (p.value) replaced = replaced.replace(p.re, p.value);
    });
    
    if (replaced !== t) {
      setTextPreserveAlignment(n, replaced);
      
      // Ensure alignment is preserved after text change
      const originalAlign = originalAlignments[index];
      if (originalAlign.attributes.textAnchor) {
        n.setAttribute('text-anchor', originalAlign.attributes.textAnchor);
      }
    }
  });

  const hadPlaceholders = nodes.some((n) => /\{\{.*\}\}/.test(n.textContent || ""));
  if (!hadPlaceholders) {
    let i = 0;
    if (businessName && nodes[i]) {
      const originalAlign = originalAlignments[i];
      setTextPreserveAlignment(nodes[i], businessName);
      
      // Preserve alignment for replaced text
      if (originalAlign.attributes.textAnchor) {
        nodes[i].setAttribute('text-anchor', originalAlign.attributes.textAnchor);
      }
      i++;
    }
    if (businessTagline && nodes[i]) {
      const originalAlign = originalAlignments[i];
      setTextPreserveAlignment(nodes[i], businessTagline);
      
      if (originalAlign.attributes.textAnchor) {
        nodes[i].setAttribute('text-anchor', originalAlign.attributes.textAnchor);
      }
      i++;
    }
    if (industry && nodes[i]) {
      const originalAlign = originalAlignments[i];
      setTextPreserveAlignment(nodes[i], industry);
      
      if (originalAlign.attributes.textAnchor) {
        nodes[i].setAttribute('text-anchor', originalAlign.attributes.textAnchor);
      }
    }
  }

  return adjustTextToFit(svg);
}

/** Updated customizeSVGGeneric to use the new alignment-preserving functions */
function customizeSVGGenericWithAlignment(
  svgString: string,
  businessName?: string,
  description?: string,
  industry?: string,
  logoUrl?: string,
  backgroundColor?: string,
  textFill?: TextFill,
) {
  const svg = parseSVG(svgString);

  // Use the new auto-fill function that preserves alignment
  autoFillTextWithAlignment(svg, businessName, description, industry);
  
  if (logoUrl) upsertLogoImage(svg, logoUrl);

  // Apply background color if provided
  if (backgroundColor) {
    applyBackground(svg, backgroundColor);
  }

  if (textFill) {
    if (textFill.mode === "SOLID") {
      applyTextColor(svg, textFill.solid);
    } else {
      applyTextGradient(svg, textFill.a, textFill.b, textFill.angle);
    }
  }

  return serializeSVG(svg);
}

// Export the functions
export {
  getTextAlignment,
  calculateTextAlignment,
  setTextPreserveAlignment,
  autoFillTextWithAlignment,
  customizeSVGGenericWithAlignment
};