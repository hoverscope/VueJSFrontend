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
    filteredProducts: [], // Store filtered products for live search
    invCount: {} // Store inventory count for each product here
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
        return total + item.price * item.count;
      }, 0);
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
      if (!this.cartItems[product.id] && product.availableInventory > 0) {
        product.availableInventory--; 
        this.invCount[product.id] = product.availableInventory;
    
        this.cartItems[product.id] = { 
          id: product.id,  // Add this line to include product ID
          title: product.title, 
          icon: product.icon,
          price: product.price,
          count: 1 
        };
        this.cartCount++;
      } else {
        console.log(`${product.title} is already in the cart.`);
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
        alert('Your order has been successfully submitted!');
        return Promise.all(
          Object.values(this.cartItems).map(item => this.updateInventory(item))
        );
      })
      .then(() => {
        this.checkoutData = { name: "", phone: "" };
        this.cartItems = {}; 
        this.showCart = false;
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
      return !!this.cartItems[product.id];
    },

    removeFromCart(productId) {
      if (this.cartItems[productId]) {
        const item = this.cartItems[productId];
        const product = this.products.find(p => p.title === item.name);
        if (product) {
          product.availableInventory += item.count;
        }

        this.cartCount -= item.count;
        this.$delete(this.cartItems, productId);
        console.log(`${item.name} removed from cart.`);
      }
    },

    getProductIcon(productId) {
        const product = this.products.find(p => p.id === productId);
        return product ? product.icon : 'default-icon-class';
    },

    performSearch() {
      console.log('Searching for:', this.searchQuery);
    
      // If the search query is empty, reset to show all products
      if (!this.searchQuery.trim()) {
        this.filteredProducts = this.products; // Reset filteredProducts to include all products
        return;
      }
    
      fetch(`https://afterschoolbackend-qm5c.onrender.com/M00909858/search_lessons?query=${encodeURIComponent(this.searchQuery)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch search results');
          }
          return response.json();
        })
        .then(data => {
          if (data.length === 0) {
            console.log('No results found. Showing all lessons.');
            this.filteredProducts = this.products; // Reset to show all products if no results
          } else {
            this.filteredProducts = data; // Update with search results
          }
        })
        .catch(error => {
          console.error('Error fetching search results:', error);
          alert('Failed to fetch search results. Please try again later.');
          this.filteredProducts = this.products; // Fallback to show all products on error
        });
    },
    
    

    matchesSearch(product) {
      const query = this.searchQuery.toLowerCase();
      return (
        product.title.toLowerCase().includes(query) ||
        product.location.toLowerCase().includes(query)
      );
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
