var ProductActionTypes = {
    AddToCart: 10,
    Click: 14,
    Checkout: 12,
    CheckoutOption: 13,
    Impression: 22,
    Purchase: 16,
    Refund: 17,
    RemoveFromCart: 11,
    ViewDetail: 15,
}

var ProductActionNames = {
    0: "Unknown",
    1: "Add To Cart",
    2: "Remove From Cart",
    3: "Checkout",
    4: "Checkout Option",
    5: "Click",
    6: "View Detail",
    7: "Purchase",
    8: "Refund",
    9: "Add To Wishlist",
    10: "Remove From Wishlist",
}

var PromotionType = {
    PromotionClick: 19,
    PromotionView: 18,
}

var PromotionTypeNames = {
    19: "Click",
    18: "View",
}
var HeapConstants = {
    EventNameItem: "Item",
    EventNameProductAction: "Product Action Event",
    EventNameProductActionPart: "Product Action: ",
    EventNamePromotionPart: "Promotion: ",
    EventNameImpression: "Impression Event",
    MaxPropertyLength: 1023,
    KeyProductName: "product_name",
    KeyProductPrice: "product_price",
    KeyProductQuantity: "product_quantity",
    KeyProductTotalProductAmount: "total_product_amount",
    KeyProductSku: "product_id",
    KeyProductBrand: "product_brand",
    KeyProductCategory: "product_category",
    KeyProductSkus: "skus",
    KeyPromotionCreative: "creative",
    KeyPromotionId: "id",
    KeyPromotionPosition: "position",
}

function CommerceHandler(common) {
    this.common = common || {};
}

CommerceHandler.prototype.logCommerceEvent = function(event) {
    /*
        Sample ecommerce event schema:
        {
            CurrencyCode: 'USD',
            DeviceId:'a80eea1c-57f5-4f84-815e-06fe971b6ef2', // MP generated
            EventAttributes: { key1: 'value1', key2: 'value2' },
            EventType: 16,
            EventCategory: 10, // (This is an add product to cart event, see below for additional ecommerce EventCategories)
            EventName: "eCommerce - AddToCart",
            MPID: "8278431810143183490",
            ProductAction: {
                Affiliation: 'aff1',
                CouponCode: 'coupon',
                ProductActionType: 7,
                ProductList: [
                    {
                        Attributes: { prodKey1: 'prodValue1', prodKey2: 'prodValue2' },
                        Brand: 'Apple',
                        Category: 'phones',
                        CouponCode: 'coupon1',
                        Name: 'iPhone',
                        Price: '600',
                        Quantity: 2,
                        Sku: "SKU123",
                        TotalAmount: 1200,
                        Variant: '64GB'
                    }
                ],
                TransactionId: "tid1",
                ShippingAmount: 10,
                TaxAmount: 5,
                TotalAmount: 1215,
            },
            UserAttributes: { userKey1: 'userValue1', userKey2: 'userValue2' }
            UserIdentities: [
                {
                    Identity: 'test@gmail.com', Type: 7
                }
            ]
        }

        If your SDK has specific ways to log different eCommerce events, see below for
        mParticle's additional ecommerce EventCategory types:

            10: ProductAddToCart, (as shown above)
            11: ProductRemoveFromCart,
            12: ProductCheckout,
            13: ProductCheckoutOption,
            14: ProductClick,
            15: ProductViewDetail,
            16: ProductPurchase,
            17: ProductRefund,
            18: PromotionView,
            19: PromotionClick,
            20: ProductAddToWishlist,
            21: ProductRemoveFromWishlist,
            22: ProductImpression
        */
    let events = [];

    switch (event.EventCategory) {
        case ProductActionTypes.Impression:
            events = buildImpressionEvents(event);
            break;
        case PromotionType.PromotionClick:
        case PromotionType.PromotionView:
            events = buildPromotionEvents(event);
            break;
        default:
            events = buildProductActionEvents(event);
    };

    events.forEach((event) => {
        window.heap.track(event.Name, event.Properties);
    });
};

function buildImpressionEvents(event) {
    let events = [];

    if (event.ProductImpressions.length > 0) {
        event.ProductImpressions.forEach((impression) => {
            let productSkus = [];
            if (impression.ProductList.length > 0) {
                impression.ProductList.forEach((product) => {
                    let [productEvent, productSku] = buildProductEvent(product);
                    events.push(productEvent);
                    if(productSku) {
                        productSkus.push(productSku);
                    }
                })
            }

            events.push(buildActionEvent(event, HeapConstants.EventNameImpression, productSkus))
        })
    }


    return events;
};

function buildPromotionEvents(event) {
    let events = [];
    let promotionIds = [];
    if (event.PromotionAction.PromotionList.length > 0) {
        event.PromotionAction.PromotionList.forEach((promotion) => {
            let [promotionEvent, promotionId] = buildPromotionEvent(promotion);
            events.push(promotionEvent);

            if(promotionId) {
                promotionIds.push(promotionId);
            }
        })
    }
    let promotionActionEventName = HeapConstants.EventNamePromotionPart + PromotionTypeNames[event.EventCategory];
    events.push(buildActionEvent(event, promotionActionEventName, promotionIds));
    return events;
}

function buildProductActionEvents(event) {
    let events = [];
    let productSkus = [];

    if (event.ProductAction.ProductList.length > 0) {
        event.ProductAction.ProductList.forEach((product) => {
            let [productEvent, productSku] = buildProductEvent(product);

            events.push(productEvent);

            if (productSku) {
                productSkus.push(productSku);
            }
        });
    }
    let actionEventName = event.ProductAction == null ? HeapConstants.EventNameProductAction : HeapConstants.EventNameProductActionPart + ProductActionNames[event.ProductAction.ProductActionType]
    events.push(buildActionEvent(event, actionEventName, productSkus));

    return events;
}

function buildActionEvent(event, eventName, productSkus) {
    let properties = event.EventAttributes == null ? {} : event.EventAttributes;
    properties[HeapConstants.KeyProductSkus] = productSkus;
    return {Name: eventName, Properties: properties};
}

function buildProductEvent(product) {
    let event = {};
    let properties = product.Attributes;
    if (!properties) {
        properties = {};
    }

    let validatedName = validateHeapPropertyValue(product.Name);
    if (validatedName) {
        properties[HeapConstants.KeyProductName] = validatedName;
    }

    let validatedPrice = validateHeapPropertyValue(product.Price);
    if (validatedPrice) {
        properties[HeapConstants.KeyProductPrice] = validatedPrice;
    }

    let validatedQuantity = validateHeapPropertyValue(product.Quantity);
    if (validatedQuantity) {
        properties[HeapConstants.KeyProductQuantity] = validatedQuantity;
    }

    let validatedTotalProductAmount = validateHeapPropertyValue(product.TotalProductAmount);
    if (validatedTotalProductAmount) {
        properties[HeapConstants.KeyProductTotalProductAmount] = validatedTotalProductAmount;
    }

    let validatedSku = validateHeapPropertyValue(product.Sku);
    if (validatedSku) {
        properties[HeapConstants.KeyProductSku] = validatedSku;
    }

    let validatedBrand = validateHeapPropertyValue(product.Brand);
    if (validatedBrand) {
        properties[HeapConstants.KeyProductBrand] = validatedBrand;
    }

    let validatedCategory = validateHeapPropertyValue(product.Category);
    if (validatedCategory) {
        properties[HeapConstants.KeyProductCategory] = validatedCategory;
    }

    event.Name = HeapConstants.EventNameItem;
    event.Properties = properties;

    let productSku = validatedSku;
    return [event, productSku];
}

function buildPromotionEvent(promotion) {
    let event = {};
    let properties = promotion.Attributes ? promotion.Attributes : {};

    let validatedPromotionValues = {
        KeyPromotionCreative: validateHeapPropertyValue(promotion.Creative),
        KeyPromotionId: validateHeapPropertyValue(promotion.Id),
        KeyPromotionPosition: validateHeapPropertyValue(promotion.Position),
    }

    Object.keys(validatedPromotionValues).forEach((key) => {
        let value = validatedPromotionValues[key];

        if (value === undefined || key === undefined) {
            return;
        }

        let constKey = HeapConstants[key];
        properties[constKey] = value;
    })
    event.Name = HeapConstants.EventNameItem;
    event.Properties = properties;
    let promotionId = validatedPromotionValues.KeyPromotionId;

    return [event, promotionId];
}

function validateHeapPropertyValue(value){
    if (typeof value === "boolean" || typeof value === "number") {
        return value;
    }

    if (value === undefined || value === null) {
        return value;
    } else if (value.length > HeapConstants.MaxPropertyLength){
        return value.substring(0, HeapConstants.MaxPropertyLength);
    } else {
        return value;
    }
}

module.exports = CommerceHandler;
