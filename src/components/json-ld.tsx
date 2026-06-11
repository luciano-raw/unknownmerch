import React from 'react';

export function JsonLd({ data }: { data: any }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "Unknown Club",
    "url": "https://www.unknownclub.store",
    "logo": "https://www.unknownclub.store/opengraph-image.png",
    "description": "Tienda oficial de Unknown Club. Streetwear exclusivo, stickers premium y accesorios para amantes de los autos modificados, stance y cultura tuning. Entregas en Talca y Linares, envíos a todo Chile.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Talca",
      "addressRegion": "Región del Maule",
      "addressCountry": "CL"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -35.4264,
      "longitude": -71.6554
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "09:00",
      "closes": "20:00"
    },
    "sameAs": [
      "https://www.instagram.com/unknownclub.store"
    ]
  };

  return <JsonLd data={schema} />;
}

export function ProductSchema({ product }: { product: any }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": "Unknown Club"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://www.unknownclub.store/product/${product.id}`,
      "priceCurrency": "CLP",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Unknown Club"
      }
    }
  };

  return <JsonLd data={schema} />;
}
