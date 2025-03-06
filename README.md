# Shopify Store Hours Manager

## The Task
Let’s imagine that a series of Shopify merchants have asked us for an app that allows their store to only operate during “open” hours.

Create a Shopify application that disables the **"Add to Cart"** button on a merchant's product detail page (PDP) during certain hours (e.g. while the store is “closed”). Instead, display a **"Store is Closed"** message when the button is disabled.

## Requirements:
- The merchant should be able to **configure the hours** during which the "Store is Closed" message is displayed.  
- This configuration should be managed through an **embedded app in Shopify Admin**.  
- The implementation should be as **seamless** for the merchant to use as possible.  
- Ensure the app works on **as many merchant's storefronts out of the box** as possible.  
- **Prevent shoppers from checking out** during the "closed" time window, even if they’ve added a product to their cart during the “open” time window.  

## Deliverables:
- **Public GitHub repository** with the project source code.  
- **Store link** for testing the implementation.

## Make sure you use those
https://shopify.dev/docs/api/functions/reference/cart-checkout-validation/graphql/common-objects/localtime

https://shopify.dev/docs/api/functions/reference/cart-checkout-validation
