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
      phone: "",
    },

    products: [],
    filteredProducts: [], 
    invCount: {}, 

    showModal: false, 
    modalProduct: null,

    isVisible: false,
    title: 'Success',
    message: 'Your order has been submitted succesfully!.',
    progressActive: false,

  },
  computed: {
    sortedProducts() {
      return this.filteredProducts.slice().sort((a, b) => {
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
        return total + item.price * item.count; // Multiply by quantity
      }, 0);
    },

    isFormValid() {
      // Check if both name and phone are not empty
      const nameValid = this.checkoutData.name.trim() !== "";
      const phoneValid = this.checkoutData.phone.trim() !== "";
  
      return nameValid && phoneValid;  // Return true if both are not empty
  },
  
    isCartEmpty() {
      return !this.showCart && this.cartCount === 0;
    }
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
      this.showCart = !this.showCart;
    },

    updateTheme() {
      const link = document.getElementById("theme-style");
      if (this.isDarkMode) {
        link.href = "src/css/styles.css"; // Assume styles.css includes both
        document.body.classList.add("dark-mode");
      } else {
        link.href = "src/css/styles.css"; // Use the same for light mode
        document.body.classList.remove("dark-mode");
      }
    },
    
    addToCart(product) {
      if (product.availableInventory > 0) {
        product.availableInventory--; 
        this.invCount[product.id] = product.availableInventory; 

        if (!this.cartItems[product.id]) {
          // If product is not already in the cart, add it
          this.cartItems[product.id] = {
            id: product.id,
            title: product.title,
            icon: product.icon,
            price: product.price,
            count: 1 // Initialize count to 1
          };
        } else {
          // If product is already in the cart, increment the count
          this.cartItems[product.id].count++;
        }

        this.cartCount++; // Update cart count
      } else {
        console.log(`${product.title} is out of stock.`);
      }
    },

    fetchProducts() {
      fetch("https://afterschoolbackend-qm5c.onrender.com/M00909858/lessons")
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch products");
          }
          return response.json();
        })
        .then((data) => {
          this.products = data;
          this.filteredProducts = data; // Initialize filteredProducts with all products
          this.products.forEach(product => {
            this.invCount[product.id] = product.availableInventory; // Initialize invCount for each product
          });
        })
        .catch((error) => {
          console.error("Error fetching products:", error);
        });
    },

    submitCheckout() {
      const nameRegex = /^[A-Za-z\s]+$/;
      if (!this.checkoutData.name || !nameRegex.test(this.checkoutData.name)) {
        alert('Please enter a valid name (letters and spaces only).');
        return; // Stop form submission
      }

      const phoneRegex = /^(\+?\d{1,3}[-\s]?)?(\(\d{3}\)|\d{3})[-\s]?\d{3}[-\s]?\d{4}$/;
      if (!this.checkoutData.phone || !phoneRegex.test(this.checkoutData.phone)) {
        alert('Please enter a valid phone number (10 digits only).');
        return; // Stop form submission
      }

      const orderData = {
        name: this.checkoutData.name,
        phone: this.checkoutData.phone,
        items: Object.values(this.cartItems),
        totalAmount: this.totalPrice,
        date: new Date().toISOString()
      };

      fetch('https://afterschoolbackend-qm5c.onrender.com/M00909858/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        this.showToast();
          return Promise.all(
          Object.values(this.cartItems).map(item => this.updateInventory(item))
        );
      })
      .then(() => {
        this.cartItems = {};  // Clear cart items
    this.cartCount = 0;    // Reset cart count
    this.showCart = false; // Close cart view
    this.checkoutData = { name: "", phone: "" };  // Clear checkout data
      })
      .catch(error => {
        console.error('Error submitting order or updating inventory:', error);
        alert('Failed to submit your order. Please try again later.');
      });
    },

    updateInventory(item) {
      return fetch(`https://afterschoolbackend-qm5c.onrender.com/M00909858/update_inventory/${item.id}`, { 
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: item.id,
          availableInventory: this.invCount[item.id] 
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to update inventory for item ${item.title}`);
        }
        return response.json();
      });
    },

    isInCart(product) {
      return product.availableInventory <= 0;
    },
    
    
    

    removeFromCart(productId) {
      if (this.cartItems[productId]) {
        const item = this.cartItems[productId];
    
        // Restore the entire count of the product to available inventory
        if (this.invCount[productId] !== undefined) {
          this.invCount[productId] += item.count;
        }
    
        // Find the product in the products array and update its availableInventory
        const product = this.products.find(p => p.id === productId);
        if (product) {
          product.availableInventory += item.count;
        }
    
        // Update cart count by subtracting the item's count
        this.cartCount -= item.count;
    
        // Remove the item from the cart
        this.$delete(this.cartItems, productId);
      }
    },
    
    
  

    getProductIcon(productId) {
        const product = this.products.find(p => p.id === productId);
        return product ? product.icon : 'default-icon-class';
    },

    showProductDetails(product) {
      this.modalProduct = product;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.modalProduct = null;
    },

    performSearch() {
      console.log("Searching for:", this.searchQuery);
    
      // If the search query is empty, reset to show all products
      if (!this.searchQuery.trim()) {
        this.filteredProducts = [...this.products]; // Ensure filteredProducts includes all products
        return;
      }
    
      fetch(
        `https://afterschoolbackend-qm5c.onrender.com/M00909858/search_lessons?query=${encodeURIComponent(
          this.searchQuery
        )}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch search results");
          }
          return response.json();
        })
        .then((data) => {
          this.filteredProducts = data.length ? data : [...this.products]; // If no results, show all products
        })
        .catch((error) => {
          console.error("Error fetching search results:", error);
          this.filteredProducts = [...this.products]; // Fallback to show all products on error
        });
    },
    
    

    matchesSearch(product) {
      const query = this.searchQuery.toLowerCase();
      return (
        product.title.toLowerCase().includes(query) ||
        product.location.toLowerCase().includes(query)
      );
    },

    showToast() {
      this.isVisible = true;
      this.progressActive = true;
      
      setTimeout(() => {
        this.isVisible = false;
      }, 5000); // Hide toast after 5 seconds
      
      setTimeout(() => {
        this.progressActive = false;
      }, 5300); // Hide progress bar after animation is complete
    },
    closeToast() {
      this.isVisible = false;
      this.progressActive = false;
    }

  },
  watch: {
    searchQuery(newQuery) {
      this.performSearch(); // Trigger search whenever the searchQuery changes
    }
  },
  mounted() {
    this.updateTheme();
    this.fetchProducts();
  },
});
