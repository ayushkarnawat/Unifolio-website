"use client";

import { ProductStoryboardVisual } from "@/components/product/ProductStoryboardVisual";
import { PRODUCT_CARDS, PRODUCT_HEADLINE } from "@/lib/productCopy";

/**
 * Product section content: headline, animated illustration and the three Track / Analyse / Plan cards.
 * Desktop and tablet: the cards sit in one row. Phone (< 640px): no cards and no carousel; the three items are
 * plain rows stacked in one column (picture on the left, then tag, title and text), split by thin dividers.
 * Approved designs: Docs/reference/product-section-prototype.html, phone: Docs/reference/mobile-view-prototype.html.
 */

export const PRODUCT_HEADING_ID = "product-heading";

const FLOAT_CLASSES = ["product-ill-float-a", "product-ill-float-b", "product-ill-float-c"];

export function ProductSection() {
  return (
    <div className="w-full flex flex-col items-center font-sans">
      <h2
        id={PRODUCT_HEADING_ID}
        className="font-heading font-extrabold text-[length:clamp(28px,5.2vw,52px)] tracking-[-0.04em] leading-[1.08] text-[#111613] text-center max-w-[20ch] [text-wrap:balance] max-sm:px-4"
      >
        {PRODUCT_HEADLINE.lead}
        <span className="text-[#22C55E]">{PRODUCT_HEADLINE.emphasis}</span>
      </h2>

      <ProductStoryboardVisual className="max-w-[1070px] mx-auto mt-[clamp(14px,2.4vw,28px)] max-sm:mt-3" />

      <div className="w-full max-w-[1180px] mt-[clamp(16px,2.6vw,30px)] max-sm:max-w-none">
        <div className="grid grid-cols-3 gap-[clamp(12px,1.6vw,20px)] max-sm:grid-cols-1 max-sm:gap-0 max-sm:px-5 max-sm:pt-1.5">
          {PRODUCT_CARDS.map((card, i) => (
            <article
              key={card.num}
              className="relative flex flex-col min-w-0 overflow-hidden bg-white border border-[rgba(17,22,19,0.07)] rounded-[20px] px-[clamp(18px,2.2vw,28px)] pt-[clamp(18px,2.2vw,28px)] pb-[clamp(18px,2.2vw,26px)] min-h-[clamp(210px,24vw,250px)] shadow-[0_1px_0_rgba(17,22,19,0.02),0_24px_40px_-34px_rgba(17,22,19,0.28)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-[3px] hover:shadow-[0_1px_0_rgba(17,22,19,0.02),0_30px_46px_-30px_rgba(34,197,94,0.4)] sm:max-[900px]:px-4 max-sm:grid max-sm:grid-cols-[76px_minmax(0,1fr)] max-sm:gap-x-[14px] max-sm:items-start max-sm:min-h-0 max-sm:overflow-visible max-sm:px-0 max-sm:py-[18px] max-sm:bg-transparent max-sm:rounded-none max-sm:border-0 max-sm:border-t max-sm:border-solid max-sm:border-t-[rgba(17,22,19,0.09)] max-sm:first:border-t-0 max-sm:shadow-none max-sm:transition-none max-sm:hover:translate-y-0 max-sm:hover:shadow-none"
            >
              <div className="flex items-center gap-2.5 max-sm:col-start-2 max-sm:row-start-1 text-[11.5px] font-bold tracking-[0.14em] uppercase text-[#6B7A70]">
                <span className="w-[30px] h-[30px] rounded-full bg-[#EAF8EF] text-[#15803D] flex items-center justify-center text-[12px] tracking-normal font-extrabold">
                  {card.num}
                </span>
                {card.label}
              </div>
              <h3 className="font-heading font-extrabold text-[length:clamp(20px,1.9vw_+_4px,26px)] tracking-[-0.035em] leading-[1.12] text-[#111613] mt-4 max-w-[80%] sm:max-[900px]:text-[length:clamp(17px,2.3vw,20px)] sm:max-[900px]:max-w-full max-sm:col-start-2 max-sm:row-start-2 max-sm:text-[18px] max-sm:mt-1 max-sm:max-w-none">
                {card.titleLead}
                <span className="text-[#22C55E]">{card.titleEmphasis}</span>
              </h3>
              <p className="relative z-[1] mt-2.5 text-[length:clamp(13.5px,1.1vw_+_6px,15px)] leading-[1.5] text-[#6B7A70] max-w-[calc(100%_-_clamp(70px,8.4vw,104px))] sm:max-[900px]:text-[13px] sm:max-[900px]:max-w-full sm:max-[900px]:pb-[70px] max-sm:col-start-2 max-sm:row-start-3 max-sm:text-[13px] max-sm:mt-[5px] max-sm:max-w-full">
                {card.body}
              </p>
              <div
                aria-hidden="true"
                className={`absolute pointer-events-none will-change-transform right-[clamp(12px,1.6vw,20px)] bottom-[clamp(16px,2vw,24px)] ${
                  i === 2 ? "w-[clamp(74px,9vw,110px)]" : "w-[clamp(66px,8vw,98px)]"
                } sm:max-[900px]:w-[clamp(56px,9vw,70px)] max-sm:static max-sm:col-start-1 max-sm:row-start-1 max-sm:row-span-3 max-sm:self-center max-sm:w-[70px] ${FLOAT_CLASSES[i] ?? ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.illustration.src}
                  width={card.illustration.width}
                  height={card.illustration.height}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                  className="block w-full h-auto"
                />
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
