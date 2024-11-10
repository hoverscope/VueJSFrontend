
let webstore = new Vue({
  el: "#app",
  data: {
    sitename: "Meow Meow Classes",
    sortOrder: "ascending",
    isDarkMode: false,
    sortAttribute: "price",
    showCart: false,
    cartCount: 0,
    cartItems: {},
    searchQuery: "",

    checkoutData: {
      name: "",
      email: "",
    },

    products: [
      {
        id: 1001,
        title: "Math Classes",
        price: 200.0,
        icon: "fas fa-calculator",
        location: "London, United Kingdom",
        availableInventory: 5,
      },
      {
        id: 1002,
        title: "Chemistry Classes",
        price: 150.0,
        icon: "fas fa-flask",
        location: "New York, USA",
        availableInventory: 5,
      },
      {
        id: 1003,
        title: "History Classes",
        price: 100.0,
        icon: "fas fa-solid fa-book",
        location: "Berlin, Germany",
        availableInventory: 5,
      },
      {
        id: 1004,
        title: "Geography Classes",
        price: 130.0,
        icon: "fas fa-globe-africa",
        location: "Paris, France",
        availableInventory: 5,
      },
      {
        id: 1005,
        title: "Physics Classes",
        price: 180.0,
        icon: "fas fa-atom",
        location: "Tokyo, Japan",
        availableInventory: 5,
      },
      {
        id: 1006,
        title: "Biology Classes",
        price: 200.0,
        icon: "fas fa-dna",
        location: "Dubai, United Kingdom",
        availableInventory: 5,
      },
      {
        id: 1007,
        title: "Music Classes",
        price: 200.0,
        icon: "fas fa-guitar",
        location: "Dubai, United Kingdom",
        availableInventory: 5,
      },
      {
        id: 1008,
        title: "Law Classes",
        price: 200.0,
        icon: "fas fa-gavel",
        location: "Dubai, United Kingdom",
        availableInventory: 5,
      },
      {
        id: 1009,
        title: "Art Classes",
        price: 200.0,
        icon: "fas fa-palette",
        location: "Dubai, United Kingdom",
        availableInventory: 5,
      },
      {
        id: 10010,
        title: "Economics Classes",
        price: 200.0,
        icon: "fas fa-money-check-alt",
        location: "Dubai, United Kingdom",
        availableInventory: 5,
      },
    ],
  },
  computed: {
    sortedProducts() {
      return this.products.slice().sort((a, b) => {
        let aVal = a[this.sortAttribute];
        let bVal = b[this.sortAttribute];

        if (typeof aVal === "string") {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }

        if (this.sortOrder === "ascending") {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    },

    totalPrice() {
      return Object.values(this.cartItems).reduce((total, item) => {
        return total + item.price * item.count;
      }, 0);
    },

    isCartEmpty() {
      return !this.showCart && this.cartCount === 0;
    },
  
  
  },
  methods: {
    toggleSortOrder() {
      this.sortOrder =
        this.sortOrder === "ascending" ? "descending" : "ascending";
    },

    toggleTheme() {
      this.isDarkMode = !this.isDarkMode; // Toggle dark mode
      this.updateTheme();
    },

    toggleCart() {
     
  
      // Allow switching from cart to products regardless of cart state
      this.showCart = !this.showCart;
    },

    updateTheme() {
      const link = document.getElementById("theme-style");
      // Apply the appropriate class based on the mode
      if (this.isDarkMode) {
        link.href = "src/css/styles.css"; // Assume styles.css includes both
        document.body.classList.add("dark-mode"); // Add dark mode class
      } else {
        link.href = "src/css/styles.css"; // Use the same for light mode
        document.body.classList.remove("dark-mode"); // Remove dark mode class
      }
    },

    addToCart(product) {
      // Check if the product is already in the cart
      if (!this.cartItems[product.id] && product.availableInventory > 0) {
        product.availableInventory--; // Reduce the available inventory
        // Add product to cart with initial count of 1
        this.cartItems[product.id] = { 
          name: product.title, 
          icon: product.icon,
          price: product.price,
          count: 1 
        };
        this.cartCount++; // Increment cart count
      } else {
        console.log(`${product.title} is already in the cart.`);
      }
    },
    

    submitCheckout() {
      // Handle form submission (e.g., validate and process order)
      console.log("Checkout Data:", this.checkoutData);
      // Reset form after submission
      this.checkoutData = {
        name: "",
        email: "",
        phone: "",
        address: "",
      };
      // Optionally, toggle the cart view
      this.showCart = false; // Optionally close the cart after submission
    },

    isInCart(product) {
      return !!this.cartItems[product.id];
    },
    removeFromCart(productId) {
      // Check if the item exists in the cart
      if (this.cartItems[productId]) {
        const item = this.cartItems[productId];
    
        // Restore the product's available inventory
        const product = this.products.find(p => p.title === item.name);
        if (product) {
          product.availableInventory += item.count; // Restore inventory
        }
    
        // Remove the item from the cart
        this.cartCount -= item.count; // Decrease cart count
        this.$delete(this.cartItems, productId); // Use Vue's reactivity method to delete the item
    
        console.log(`${item.name} removed from cart.`);
      }
    },
    

    getProductImage(productId) {
        const product = this.products.find(p => p.id === productId);
        // Return the icon class or path, based on how you are using the icons
        return product ? product.icon : 'default-icon-class'; // Provide a default icon if the product is not found
      },

      performSearch() {
        console.log('Searching for:', this.searchQuery);
      },
    
      matchesSearch(product) {
        const query = this.searchQuery.toLowerCase();
        return (
          product.title.toLowerCase().includes(query) ||
          product.location.toLowerCase().includes(query)
        );
        
      },
      

      
  
  
  },
  mounted() {
    this.updateTheme();
  },
});
