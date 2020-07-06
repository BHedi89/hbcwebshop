"use strict";

const client = contentful.createClient({
    // This is the space ID. A space is like a project folder in Contentful terms
    space: "8giyq4i3wcjo",
    // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
    accessToken: "BuQwxSF0EdKsATh9r4_vRGeb8DHPd5Es8cg-svEoemk"
});

//variables
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const closeCartButton = document.querySelector(".close-cart");
const removeItem = document.querySelector(".remove-item");
const itemAmount = document.querySelector(".item-amount");
const cartTotal = document.querySelector(".cart-total");
const clearCartButton = document.querySelector(".clear-cart-btn");
const productDOM = document.querySelector(".product-center");
const productDOM2 = document.querySelector(".product-center2")
const cartItemDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartBtn = document.querySelector(".cart-btn");
const modalContent = document.querySelector(".modal-content");
const menuBtn = document.querySelector(".menu-btn");
const menuOverlay = document.querySelector(".menu-overlay");

//cart array
let cart = [];

//buttons arrays
let cartButtonsList = [];
let infoButtonsList = [];

//get products from Contentful
class Product {
    async getProducts() {
        try {
            let contentful = await client.getEntries({
                content_type: "hbcProducts"
            });

            let products = contentful.items;
            products = products.map(item => {
                const { title, price, description, type } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image, description, type };
            });

            return products;
        } catch (error) {
            console.log(error);
        };
    };
}

class UI {
    //display products from Contentful
    displayBeadProducts(products) {
        let result = "";
        products.forEach(product => {
            if(product.type === "bead") {
                result += `
                    <article class="product">
                    <div class="card">
                        <div class="products-images">
                            <img
                            src=${product.image}
                            alt="product"
                            class="product-img card-img-top zoom"
                            />
                            <button class="add-cart-btn" data-id=${product.id}>
                            <i class="fas fa-shopping-cart second-shopping-cart"></i>
                            add to cart
                            </button>
                        </div>
                        <div class="card-body">
                        <p>${product.title}<button class="fas fa-info-circle" data-id=${product.id}></button></p>
                        <p>${product.price} HUF</p>
                        </div>
                    </div>
                    </article>`;
            }
        });
        productDOM.innerHTML = result;
    };

    //display products from Contentful
    displaySoutacheProducts(products) {
        let result = "";
        products.forEach(product => {
            if(product.type === "soutache") {
                result += `
                    <article class="product">
                    <div class="card">
                        <div class="products-images">
                            <img
                            src=${product.image}
                            alt="product"
                            class="product-img card-img-top zoom"
                            />
                            <button class="add-cart-btn" data-id=${product.id}>
                            <i class="fas fa-shopping-cart second-shopping-cart"></i>
                            add to cart
                            </button>
                        </div>
                        <div class="card-body">
                        <p>${product.title}<button class="fas fa-info-circle" data-id=${product.id}></button></p>
                        <p>${product.price} HUF</p>
                        </div>
                    </div>
                    </article>`;
            }
        });
        productDOM2.innerHTML = result;
    };

    //"add to cart" buttons funcionality
    getCartButton() {
        let cartButtons = [...document.querySelectorAll(".add-cart-btn")]; //make an array from the buttons
        cartButtonsList = cartButtons;

        cartButtons.forEach(button => {
            let buttonId = button.dataset.id;
            let inCart = cart.find(item => item.id === buttonId);

            //if the product is in the cart
            if (inCart) {
                cartButtons.innerText = 'In Cart';
                cartButtons.disabled = true;
            };

            button.addEventListener("click", event => {
                event.target.innerText = 'In Cart';
                event.target.disabled = true;

                //get product from the products
                let cartItem = { ...Storage.getProduct(buttonId), amount: 1 };
                //add product to the cart
                cart = [...cart, cartItem];
                //save cart in the local storage
                Storage.saveCart(cart);
                //set cart values
                this.setCartValues(cart);
                //display cart items
                this.displayProductToTheCart(cartItem);
                //show the cart
                this.showCart();
            });
        });
    };

    //set vlaues after add a product to the cart
    setCartValues(cart) {
        let tempTotal = 0;
        let itemTotal = 0;

        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemTotal += item.amount;
        });

        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemTotal;
    };

    //display a product to the cart
    displayProductToTheCart(item) {
        const createDiv = document.createElement("div");
        createDiv.classList.add("cart-item");
        createDiv.innerHTML = ` 
            <img src=${item.image} alt="product">
            <div>
              <h4>${item.title}</h4>
              <h5>${item.price} Ft</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">${item.amount}</p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`;
        cartContent.appendChild(createDiv);
    };

    //cart show
    showCart() {
        cartOverlay.classList.add("transparentBcg");
        cartItemDOM.classList.add("showCart");
    };

    //setup the application values
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener("click", this.showCart);
        closeCartButton.addEventListener("click", this.hideCart);
    };

    //populate the cart
    populateCart() {
        cart.forEach(item => this.displayProductToTheCart(item));
    };

    //hide the cart
    hideCart() {
        cartOverlay.classList.remove("transparentBcg");
        cartItemDOM.classList.remove("showCart");
    };

    //how to work the cart functions like increase/decrease products number, remove product etc.
    cartLogic() {
        clearCartButton.addEventListener("click", () => {
            this.clearCart();
        });

        cartContent.addEventListener("click", event => {
            if (event.target.classList.contains("remove-item")) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                //remove item
                this.removeItem(id);
            } else if (event.target.classList.contains("fa-chevron-up")) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveProduct(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            } else if (event.target.classList.contains("fa-chevron-down")) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                } else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            };
        });
    };

    //clear out everything from the cart
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        }
        this.hideCart();
    };

    //remove one product from the cart
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart second-shopping-cart"></i>add to cart`;
    };

    //return only one cart button from the array
    getSingleButton(id) {
        return cartButtonsList.find(button => button.dataset.id === id);
    };

    //show product info in a modal
    getProductInfo() {
        let infoButtons = [...document.querySelectorAll(".fa-info-circle")]; //make an array from the buttons
        infoButtonsList = infoButtons;

        infoButtons.forEach(button => {
            let modal = document.getElementById("myModal");
            let closeModal = document.getElementsByClassName("fa-window-close")[0];
            let buttonId = button.dataset.id;

            button.addEventListener("click", () => {
                //show modal
                modal.style.display = "block";

                //display image info into the modal
                let modalInfo = { ...Storage.getProduct(buttonId) };
                this.displayModal(modalInfo);
            });

            closeModal.addEventListener("click", () => {
                //close the modal
                modal.style.display = "none";

                //clear the modal
                this.clearModal();
            });
        });
    };

    //clear the modal
    clearModal() {
        const modalItem = document.querySelector(".modal-item");
        modalContent.removeChild(modalItem);
    };

    //display the modal
    displayModal(product) {
        const createDiv = document.createElement("div");
        createDiv.classList.add("modal-item");
        createDiv.innerHTML = `
          <img class="modal-img responsive-modal-img" src=${product.image}>
          <p class="productInfo">Product name: ${product.title}</p>
          <p class="productInfo">Price: ${product.price} Ft</p>
          <p class="productInfo">Description: ${product.description}</p>`;
        modalContent.appendChild(createDiv);
    };

    //get the menu from menu icon on the header
    getMenu() {
        menuBtn.addEventListener("click", () => {
            document.getElementById("myMenu").style.width = "250px";
            this.showMenu();
        });
    };

    //close the menu with it's "x" button
    closeMenu() {
        let closeMenuBtn = document.querySelector("#closeMenu");

        closeMenuBtn.addEventListener("click", () => {
            document.getElementById("myMenu").style.width = "0";
            this.hideMenu();
        });
    };

    //show the menu
    showMenu() {
        menuOverlay.classList.add("transparentBcgMenu");
    };

    //hide the menu
    hideMenu() {
        menuOverlay.classList.remove("transparentBcgMenu");
    };

    scrollDownToBeadCollection(){
        const beadBtn = document.querySelector(".bead-btn");
        const beadCollection = document.querySelector(".bead-title");

        beadBtn.addEventListener("click", () => {
            beadCollection.scrollIntoView();
        });

    };

    scrollDownToSoutacheCollection() {
        const soutacheBtn = document.querySelector(".soutache-btn");
        const soutacheCollection = document.querySelector(".soutache-title");

        soutacheBtn.addEventListener("click", () => {
            soutacheCollection.scrollIntoView();
        });
    };

    goBackToHomePage() {
        const homePage = document.querySelector(".menu-to-home");

        homePage.addEventListener("click", () => {
            window.open("https://hedisbeadcollection.netlify.app");
        });
    };

    scrollDownToProduct() {
        const productBtn = document.querySelector(".menu-to-products");
        const products = document.querySelector(".header2-container");

        productBtn.addEventListener("click", () => {
            document.getElementById("myMenu").style.width = "0";
            this.hideMenu();
            products.scrollIntoView();
        });
    };

    scrollDownToContact() {
        const productBtn = document.querySelector(".menu-to-contact");
        const products = document.querySelector(".footer");

        productBtn.addEventListener("click", () => {
            document.getElementById("myMenu").style.width = "0";
            this.hideMenu();
            products.scrollIntoView();
        });
    };
}

//using local storage to save datas
class Storage {
    static saveProduct(products) {
        localStorage.setItem("products", JSON.stringify(products));
    };

    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    };

    static saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
    };

    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : [];
    };
};

//DOM load
document.addEventListener("DOMContentLoaded", () => {
    const products = new Product();
    const ui = new UI();

    //setup APP
    ui.setupAPP();

    products.getProducts().then(products => {
        ui.displayBeadProducts(products);
        ui.displaySoutacheProducts(products);
        Storage.saveProduct(products);
    }).then(() => {
        ui.getCartButton();
        ui.cartLogic();
        ui.getProductInfo();
        ui.getMenu();
        ui.closeMenu();
        ui.scrollDownToBeadCollection();
        ui.scrollDownToSoutacheCollection();
        ui.goBackToHomePage();
        ui.scrollDownToProduct();
        ui.scrollDownToContact();
    });

});