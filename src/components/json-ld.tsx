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
    "name": "FerLu Store",
    "url": "https://ferlu.store",
    "logo": "https://ferlu.store/opengraph-image.png",
    "description": "Tu tienda de belleza favorita en Chile. Especialistas en cuidado capilar, corporal y productos Bubbaluu. Envíos nacionales y entregas en Talca, Linares y Longaví.",
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
      "https://www.instagram.com/ferlu.store"
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
      "name": product.name.toLowerCase().includes('bubbaluu') ? 'Bubbaluu' : 'FerLu Store'
    },
    "offers": {
      "@type": "Offer",
      "url": `https://ferlu.store/product/${product.id}`,
      "priceCurrency": "CLP",
      "price": product.price,
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "FerLu Store"
      }
    }
  };

  return <JsonLd data={schema} />;
}
