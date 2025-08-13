describe('Admin Workflow', () => {
  let testDrone;

  before(() => {
    // Register admin user if not exists
    cy.registerUser({
      firstName: 'Admin',
      lastName: 'User',
      email: Cypress.env('adminEmail'),
      password: Cypress.env('adminPassword'),
      role: 'admin'
    });
  });

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  afterEach(() => {
    // Cleanup any test drones created during tests
    if (testDrone) {
      cy.deleteDrone(testDrone._id);
      testDrone = null;
    }
  });

  describe('Admin Authentication', () => {
    it('should login as admin successfully', () => {
      cy.logout();
      cy.visit('/admin/login');
      
      cy.get('[data-testid="email-input"]').type(Cypress.env('adminEmail'));
      cy.get('[data-testid="password-input"]').type(Cypress.env('adminPassword'));
      cy.get('[data-testid="login-button"]').click();
      
      cy.url().should('include', '/admin');
      cy.contains('Admin Dashboard').should('be.visible');
    });

    it('should redirect to login when accessing admin routes without authentication', () => {
      cy.logout();
      cy.visit('/admin/products');
      
      cy.url().should('include', '/login');
    });

    it('should prevent customer access to admin routes', () => {
      cy.logout();
      cy.loginAsCustomer();
      cy.visit('/admin/products', { failOnStatusCode: false });
      
      // Should be redirected or show access denied
      cy.url().should('not.include', '/admin/products');
    });
  });

  describe('Admin Dashboard', () => {
    beforeEach(() => {
      cy.intercept('GET', `${Cypress.env('apiUrl')}/admin/stats`).as('getAdminStats');
    });

    it('should display admin dashboard with statistics', () => {
      cy.visit('/admin');
      
      cy.contains('Admin Dashboard').should('be.visible');
      cy.contains('Welcome back').should('be.visible');
      
      // Check stat cards
      cy.contains('Total Products').should('be.visible');
      cy.contains('Total Orders').should('be.visible');
      cy.contains('Total Users').should('be.visible');
      cy.contains('Total Revenue').should('be.visible');
    });

    it('should navigate to product management from dashboard', () => {
      cy.visit('/admin');
      
      cy.contains('Total Products').click();
      cy.url().should('include', '/admin/products');
    });

    it('should navigate to order management from dashboard', () => {
      cy.visit('/admin');
      
      cy.contains('Total Orders').click();
      cy.url().should('include', '/admin/orders');
    });

    it('should display recent orders and alerts', () => {
      cy.visit('/admin');
      
      cy.contains('Recent Orders').should('be.visible');
      cy.contains('Alerts').should('be.visible');
      cy.contains('System running smoothly').should('be.visible');
    });
  });

  describe('Product Management', () => {
    beforeEach(() => {
      cy.intercept('GET', `${Cypress.env('apiUrl')}/drones*`).as('getDrones');
      cy.intercept('POST', `${Cypress.env('apiUrl')}/drones`).as('createDrone');
      cy.intercept('PUT', `${Cypress.env('apiUrl')}/drones/*`).as('updateDrone');
      cy.intercept('DELETE', `${Cypress.env('apiUrl')}/drones/*`).as('deleteDrone');
    });

    it('should display product management page', () => {
      cy.visit('/admin/products');
      cy.waitForApi('@getDrones');
      
      cy.contains('Product Management').should('be.visible');
      cy.contains('Add New Drone').should('be.visible');
      cy.contains('Drone List').should('be.visible');
    });

    it('should create a new drone', () => {
      cy.visit('/admin/products');
      cy.waitForApi('@getDrones');
      
      // Navigate to add drone form
      cy.contains('Add New Drone').click();
      cy.url().should('include', '/admin/products/add');
      
      // Fill drone form
      const droneData = {
        name: 'Admin Test Drone',
        model: 'ATD-2024',
        price: 1899,
        description: 'A drone created through admin panel testing',
        category: 'camera',
        specifications: {
          weight: 1200,
          batteryCapacity: 6000,
          flightTime: 35,
          maxSpeed: 70,
          controlRange: 8000,
          dimensions: {
            length: 40,
            width: 40,
            height: 15
          }
        }
      };
      
      cy.fillDroneForm(droneData);
      
      // Submit form
      cy.get('[data-testid="save-drone-button"]').click();
      cy.waitForApi('@createDrone');
      
      // Should redirect to product list
      cy.url().should('include', '/admin/products');
      cy.contains('Admin Test Drone').should('be.visible');
      
      // Store created drone for cleanup
      cy.get('@createDrone').then((interception) => {
        testDrone = interception.response.body.data.drone;
      });
    });

    it('should validate drone form fields', () => {
      cy.visit('/admin/products/add');
      
      // Try to submit empty form
      cy.get('[data-testid="save-drone-button"]').click();
      
      // Should show validation errors
      cy.contains('required').should('be.visible');
    });

    it('should edit an existing drone', () => {
      // First create a drone
      cy.createTestDrone({
        name: 'Drone to Edit',
        model: 'DTE-2024'
      }).then((response) => {
        testDrone = response.body.data.drone;
        
        cy.visit('/admin/products');
        cy.waitForApi('@getDrones');
        
        // Find and click edit button for the drone
        cy.contains('Drone to Edit').parent().parent().within(() => {
          cy.get('[data-testid="edit-drone-button"]').click();
        });
        
        cy.url().should('include', `/admin/products/edit/${testDrone._id}`);
        
        // Update drone name
        cy.get('[data-testid="drone-name-input"]').clear().type('Updated Drone Name');
        
        // Submit form
        cy.get('[data-testid="save-drone-button"]').click();
        cy.waitForApi('@updateDrone');
        
        // Should redirect to product list
        cy.url().should('include', '/admin/products');
        cy.contains('Updated Drone Name').should('be.visible');
      });
    });

    it('should delete a drone', () => {
      // First create a drone
      cy.createTestDrone({
        name: 'Drone to Delete',
        model: 'DTD-2024'
      }).then((response) => {
        const droneToDelete = response.body.data.drone;
        
        cy.visit('/admin/products');
        cy.waitForApi('@getDrones');
        
        // Find and click delete button for the drone
        cy.contains('Drone to Delete').parent().parent().within(() => {
          cy.get('[data-testid="delete-drone-button"]').click();
        });
        
        // Confirm deletion in dialog
        cy.contains('Confirm Delete').should('be.visible');
        cy.contains('Are you sure you want to delete').should('be.visible');
        cy.get('[data-testid="confirm-delete-button"]').click();
        
        cy.waitForApi('@deleteDrone');
        
        // Drone should be removed from list
        cy.contains('Drone to Delete').should('not.exist');
      });
    });

    it('should filter drones in product list', () => {
      cy.visit('/admin/products');
      cy.waitForApi('@getDrones');
      
      // Show filters
      cy.contains('Show Filters').click();
      cy.get('[data-testid="drone-filters"]').should('be.visible');
      
      // Apply category filter
      cy.get('[data-testid="category-filter"]').click();
      cy.get('[data-value="camera"]').click();
      
      cy.waitForApi('@getDrones');
      
      // Should show filtered results
      cy.get('[data-testid="drone-list"]').should('be.visible');
    });

    it('should display drone stock status correctly', () => {
      // Create drones with different stock levels
      cy.createTestDrone({
        name: 'In Stock Drone',
        stockQuantity: 10,
        inStock: true
      }).then((response) => {
        testDrone = response.body.data.drone;
        
        cy.visit('/admin/products');
        cy.waitForApi('@getDrones');
        
        // Should show "In Stock" status
        cy.contains('In Stock Drone').parent().parent().within(() => {
          cy.contains('In Stock').should('be.visible');
        });
      });
    });
  });

  describe('Order Management', () => {
    let testOrder;

    beforeEach(() => {
      cy.intercept('GET', `${Cypress.env('apiUrl')}/orders*`).as('getOrders');
      cy.intercept('PUT', `${Cypress.env('apiUrl')}/orders/*/status`).as('updateOrderStatus');
      
      // Create a test drone and order
      cy.createTestDrone().then((droneResponse) => {
        testDrone = droneResponse.body.data.drone;
        
        cy.createTestOrder({
          droneId: testDrone._id,
          quantity: 1,
          shippingAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'United States'
          },
          customerInfo: {
            firstName: 'Test',
            lastName: 'Customer',
            email: 'test@example.com',
            phone: '+1234567890'
          }
        }).then((orderResponse) => {
          testOrder = orderResponse.body.data.order;
        });
      });
    });

    it('should display order management page', () => {
      cy.visit('/admin/orders');
      cy.waitForApi('@getOrders');
      
      cy.contains('Order Management').should('be.visible');
      cy.contains('All Orders').should('be.visible');
    });

    it('should display orders in the list', () => {
      cy.visit('/admin/orders');
      cy.waitForApi('@getOrders');
      
      // Should show the test order
      cy.contains(testOrder._id.substring(0, 8)).should('be.visible');
      cy.contains('Test Customer').should('be.visible');
      cy.contains('pending').should('be.visible');
    });

    it('should update order status', () => {
      cy.visit('/admin/orders');
      cy.waitForApi('@getOrders');
      
      // Find the test order and update its status
      cy.contains(testOrder._id.substring(0, 8)).parent().parent().within(() => {
        cy.get('[data-testid="order-status-select"]').click();
      });
      
      cy.get('[data-value="confirmed"]').click();
      cy.waitForApi('@updateOrderStatus');
      
      // Should show updated status
      cy.contains('confirmed').should('be.visible');
    });

    it('should filter orders by status', () => {
      cy.visit('/admin/orders');
      cy.waitForApi('@getOrders');
      
      // Apply status filter
      cy.get('[data-testid="status-filter"]').click();
      cy.get('[data-value="pending"]').click();
      
      cy.waitForApi('@getOrders');
      
      // Should show only pending orders
      cy.contains('pending').should('be.visible');
    });

    it('should view order details', () => {
      cy.visit('/admin/orders');
      cy.waitForApi('@getOrders');
      
      // Click on order to view details
      cy.contains(testOrder._id.substring(0, 8)).click();
      
      cy.url().should('include', `/admin/orders/${testOrder._id}`);
      
      // Should show order details
      cy.contains('Order Details').should('be.visible');
      cy.contains('Test Customer').should('be.visible');
      cy.contains('123 Test St').should('be.visible');
    });
  });

  describe('Media Management', () => {
    beforeEach(() => {
      cy.createTestDrone().then((response) => {
        testDrone = response.body.data.drone;
      });
    });

    it('should upload drone images', () => {
      cy.visit(`/admin/products/edit/${testDrone._id}`);
      
      // Upload image
      cy.get('[data-testid="image-upload"]').selectFile('cypress/fixtures/test-drone-image.jpg', {
        force: true
      });
      
      // Should show uploaded image preview
      cy.get('[data-testid="image-preview"]').should('be.visible');
      
      // Save drone with new image
      cy.get('[data-testid="save-drone-button"]').click();
      
      // Should redirect to product list
      cy.url().should('include', '/admin/products');
    });

    it('should handle image upload errors gracefully', () => {
      cy.visit(`/admin/products/edit/${testDrone._id}`);
      
      // Try to upload invalid file type
      cy.get('[data-testid="image-upload"]').selectFile('cypress/fixtures/invalid-file.txt', {
        force: true
      });
      
      // Should show error message
      cy.contains('Invalid file type').should('be.visible');
    });
  });

  describe('Admin Navigation', () => {
    it('should navigate between admin sections', () => {
      cy.visit('/admin');
      
      // Navigate to products
      cy.get('[data-testid="admin-nav-products"]').click();
      cy.url().should('include', '/admin/products');
      
      // Navigate to orders
      cy.get('[data-testid="admin-nav-orders"]').click();
      cy.url().should('include', '/admin/orders');
      
      // Navigate back to dashboard
      cy.get('[data-testid="admin-nav-dashboard"]').click();
      cy.url().should('include', '/admin');
    });

    it('should logout from admin panel', () => {
      cy.visit('/admin');
      
      cy.get('[data-testid="admin-logout-button"]').click();
      
      // Should redirect to login page
      cy.url().should('include', '/login');
      
      // Should not be able to access admin routes
      cy.visit('/admin', { failOnStatusCode: false });
      cy.url().should('include', '/login');
    });
  });
});