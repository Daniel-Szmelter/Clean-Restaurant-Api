using CleanRestaurantApi.Entities;
using CleanRestaurantAPI.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace CleanRestaurantApi.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            if (context.Database.CanConnect())
            {
                if (!await context.Category.AnyAsync())
                {
                    var Category = new List<Category>
                {
                    new Category { Name = "Pizza" },
                    new Category { Name = "Pasta" },
                    new Category { Name = "Drinks" }
                };
                    context.Category.AddRange(Category);
                    context.SaveChanges();
                }
                if (!await context.Restaurant.AnyAsync())
                {
                    var pizzaCategory = await context.Category.FirstAsync(c => c.Name == "Pizza");
                    var pastaCategory = await context.Category.FirstAsync(c => c.Name == "Pasta");
                    var drinksCategory = await context.Category.FirstAsync(c => c.Name == "Drinks");

                    var restaurants = new List<Restaurant>
                    {
                    new Restaurant
                    {
                        Name = "Roma",
                        City = "Milano",
                        Street = "Via Ancona",
                        Dishes = new List<Dish>
                        {
                            new Dish { Name = "Margherita", Price = 20m, CategoryId = pizzaCategory.Id, Description = "Classic pizza with tomato sauce, mozzarella, and fresh basil." },
                            new Dish { Name = "Pepperoni", Price = 25m, CategoryId = pizzaCategory.Id, Description = "Crispy pizza topped with spicy pepperoni and mozzarella cheese." },
                            new Dish { Name = "Quattro Formaggi", Price = 28m, CategoryId = pizzaCategory.Id, Description = "Four-cheese pizza with mozzarella, gorgonzola, parmesan, and ricotta." },
                            new Dish { Name = "Prosciutto", Price = 27m, CategoryId = pizzaCategory.Id, Description = "Pizza topped with Italian prosciutto and fresh arugula." },
                            new Dish { Name = "Spaghetti Aglio e Olio", Price = 19m, CategoryId = pastaCategory.Id, Description = "Spaghetti with garlic, chili flakes, and extra virgin olive oil." },
                            new Dish { Name = "Lasagna", Price = 26m, CategoryId = pastaCategory.Id, Description = "Layers of pasta with meat ragù, béchamel sauce, and cheese." },
                            new Dish { Name = "Tiramisu Shake", Price = 14m, CategoryId = drinksCategory.Id, Description = "Creamy milkshake inspired by the classic Italian tiramisu dessert." },
                            new Dish { Name = "Espresso", Price = 7m, CategoryId = drinksCategory.Id, Description = "Strong and aromatic Italian espresso shot." },
                            new Dish { Name = "Lemonade", Price = 9m, CategoryId = drinksCategory.Id, Description = "Refreshing homemade lemonade with fresh lemons." },
                            new Dish { Name = "Cappuccino", Price = 10m, CategoryId = drinksCategory.Id, Description = "Italian coffee with steamed milk foam." }
                        }
                    },

                    // 2. Bella Italia
                    new Restaurant
                    {
                        Name = "Bella Italia",
                        City = "Firenze",
                        Street = "Correduria",
                        Dishes = new List<Dish>
                        {
                            new Dish { Name = "Carbonara", Price = 22m, CategoryId = pastaCategory.Id, Description = "Spaghetti with creamy egg sauce, pancetta, and pecorino cheese." },
                            new Dish { Name = "Bolognese", Price = 23m, CategoryId = pastaCategory.Id, Description = "Traditional pasta with rich tomato and minced beef sauce." },
                            new Dish { Name = "Fettuccine Alfredo", Price = 24m, CategoryId = pastaCategory.Id, Description = "Creamy fettuccine pasta with butter and parmesan cheese." },
                            new Dish { Name = "Penne Arrabbiata", Price = 21m, CategoryId = pastaCategory.Id, Description = "Spicy pasta with garlic, chili, and tomato sauce." },
                            new Dish { Name = "Diavola Pizza", Price = 27m, CategoryId = pizzaCategory.Id, Description = "Spicy pizza with hot salami and chili peppers." },
                            new Dish { Name = "Capricciosa Pizza", Price = 28m, CategoryId = pizzaCategory.Id, Description = "Pizza topped with ham, mushrooms, artichokes, and olives." },
                            new Dish { Name = "House Red Wine", Price = 18m, CategoryId = drinksCategory.Id, Description = "Glass of rich house-selected red wine." },
                            new Dish { Name = "Mineral Water", Price = 6m, CategoryId = drinksCategory.Id, Description = "Refreshing still mineral water." },
                            new Dish { Name = "Limoncello", Price = 15m, CategoryId = drinksCategory.Id, Description = "Italian lemon liqueur served chilled." },
                            new Dish { Name = "Negroni", Price = 16m, CategoryId = drinksCategory.Id, Description = "Classic Italian cocktail with gin, vermouth, and Campari." }
                        }
                    },

                    // 3. Lakeside Lounge
                    new Restaurant
                    {
                        Name = "Lakeside Lounge",
                        City = "Nashville",
                        Street = "Woodland St",
                        Dishes = new List<Dish>
                        {
                            new Dish { Name = "Coca Cola", Price = 8m, CategoryId = drinksCategory.Id, Description = "Classic fizzy soft drink." },
                            new Dish { Name = "Orange Juice", Price = 10m, CategoryId = drinksCategory.Id, Description = "Freshly squeezed orange juice." },
                            new Dish { Name = "Iced Tea", Price = 9m, CategoryId = drinksCategory.Id, Description = "Chilled tea served with lemon." },
                            new Dish { Name = "Margarita Pizza", Price = 22m, CategoryId = pizzaCategory.Id, Description = "Classic pizza with mozzarella and tomato sauce." },
                            new Dish { Name = "BBQ Chicken Pizza", Price = 29m, CategoryId = pizzaCategory.Id, Description = "Pizza topped with barbecue chicken and red onions." },
                            new Dish { Name = "Shrimp Pasta", Price = 32m, CategoryId = pastaCategory.Id, Description = "Pasta tossed with shrimp, garlic, and white wine sauce." },
                            new Dish { Name = "Veggie Pasta", Price = 27m, CategoryId = pastaCategory.Id, Description = "Pasta with seasonal vegetables and olive oil." },
                            new Dish { Name = "Smoothie Bowl", Price = 16m, CategoryId = drinksCategory.Id, Description = "Fresh fruit smoothie served with granola and berries." },
                            new Dish { Name = "House Beer", Price = 12m, CategoryId = drinksCategory.Id, Description = "Locally brewed draft beer." },
                            new Dish { Name = "Whiskey Sour", Price = 14m, CategoryId = drinksCategory.Id, Description = "Classic American cocktail with whiskey and lemon juice." }
                        }
                    },

                    // 4. Napoli Express
                    new Restaurant
                    {
                        Name = "Napoli Express",
                        City = "Napoli",
                        Street = "Via Roma",
                        Dishes = new List<Dish>
                        {
                            new Dish { Name = "Diavola", Price = 26m, CategoryId = pizzaCategory.Id, Description = "Spicy pizza with salami and chili." },
                            new Dish { Name = "Quattro Stagioni", Price = 29m, CategoryId = pizzaCategory.Id, Description = "Pizza divided into four sections with seasonal toppings." },
                            new Dish { Name = "Marinara", Price = 18m, CategoryId = pizzaCategory.Id, Description = "Simple pizza with tomato, garlic, and oregano." },
                            new Dish { Name = "Pasta Napoli", Price = 22m, CategoryId = pastaCategory.Id, Description = "Pasta with tomato sauce and basil." },
                            new Dish { Name = "Pasta Pesto", Price = 24m, CategoryId = pastaCategory.Id, Description = "Pasta with homemade basil pesto sauce." },
                            new Dish { Name = "Pasta Siciliana", Price = 25m, CategoryId = pastaCategory.Id, Description = "Pasta with eggplant, tomato, and ricotta salata." },
                            new Dish { Name = "Limonata", Price = 9m, CategoryId = drinksCategory.Id, Description = "Traditional Italian lemon soda." },
                            new Dish { Name = "Negroni", Price = 15m, CategoryId = drinksCategory.Id, Description = "Classic cocktail with gin, vermouth, and Campari." },
                            new Dish { Name = "Espresso Doppio", Price = 8m, CategoryId = drinksCategory.Id, Description = "Double shot of Italian espresso." },
                            new Dish { Name = "Campari Soda", Price = 14m, CategoryId = drinksCategory.Id, Description = "Refreshing cocktail with Campari and soda water." }
                        }
                    },

                    // 5. Trattoria Venezia
                    new Restaurant
                    {
                        Name = "Trattoria Venezia",
                        City = "Venezia",
                        Street = "Ponte Rialto",
                        Dishes = new List<Dish>
                        {
                            new Dish { Name = "Seafood Pizza", Price = 32m, CategoryId = pizzaCategory.Id, Description = "Pizza topped with shrimp, mussels, and calamari." },
                            new Dish { Name = "Vegetarian Pizza", Price = 24m, CategoryId = pizzaCategory.Id, Description = "Pizza with seasonal vegetables and mozzarella." },
                            new Dish { Name = "Black Truffle Pasta", Price = 35m, CategoryId = pastaCategory.Id, Description = "Tagliatelle pasta with creamy black truffle sauce." },
                            new Dish { Name = "Seafood Spaghetti", Price = 34m, CategoryId = pastaCategory.Id, Description = "Spaghetti with clams, mussels, and shrimp." },
                            new Dish { Name = "Risotto al Nero", Price = 33m, CategoryId = pastaCategory.Id, Description = "Squid ink risotto with calamari." },
                            new Dish { Name = "Aperol Spritz", Price = 14m, CategoryId = drinksCategory.Id, Description = "Refreshing cocktail with Aperol, prosecco, and soda." },
                            new Dish { Name = "Bellini", Price = 15m, CategoryId = drinksCategory.Id, Description = "Peach cocktail with prosecco." },
                            new Dish { Name = "Prosecco", Price = 18m, CategoryId = drinksCategory.Id, Description = "Italian sparkling wine." },
                            new Dish { Name = "Espresso Macchiato", Price = 9m, CategoryId = drinksCategory.Id, Description = "Espresso with a dash of milk foam." },
                            new Dish { Name = "Hot Chocolate", Price = 12m, CategoryId = drinksCategory.Id, Description = "Rich and creamy Italian hot chocolate." }
                        }
                    },

                    // 6. New York Slice
                    new Restaurant
                    {
                        Name = "New York Slice",
                        City = "New York",
                        Street = "5th Avenue",
                        Dishes = new List<Dish>
                        {
                            new Dish { Name = "NY Cheese Pizza", Price = 25m, CategoryId = pizzaCategory.Id, Description = "Classic New York-style cheese pizza." },
                            new Dish { Name = "Pepperoni Slice", Price = 28m, CategoryId = pizzaCategory.Id, Description = "Large slice of pizza with pepperoni." },
                            new Dish { Name = "Meatball Pasta", Price = 30m, CategoryId = pastaCategory.Id, Description = "Spaghetti with Italian meatballs in marinara sauce." },
                            new Dish { Name = "Chicken Alfredo", Price = 29m, CategoryId = pastaCategory.Id, Description = "Creamy pasta with grilled chicken." },
                            new Dish { Name = "Buffalo Wings", Price = 22m, CategoryId = drinksCategory.Id, Description = "Spicy buffalo chicken wings served with dip." },
                            new Dish { Name = "NY Cheesecake Shake", Price = 16m, CategoryId = drinksCategory.Id, Description = "Milkshake inspired by New York cheesecake." },
                            new Dish { Name = "Root Beer", Price = 10m, CategoryId = drinksCategory.Id, Description = "Classic American root beer." },
                            new Dish { Name = "Craft IPA", Price = 15m, CategoryId = drinksCategory.Id, Description = "Locally brewed craft IPA." },
                            new Dish { Name = "Manhattan", Price = 18m, CategoryId = drinksCategory.Id, Description = "Classic cocktail with whiskey, vermouth, and bitters." },
                            new Dish { Name = "Hot Dog Pizza", Price = 27m, CategoryId = pizzaCategory.Id, Description = "New York-style pizza topped with hot dog slices and mustard." }
                        }
                    },

                    // 7. Tokyo Fusion
                    new Restaurant
                    {
                        Name = "Tokyo Fusion",
                        City = "Tokyo",
                        Street = "Shibuya Crossing",
                        Dishes = new List<Dish>
                        {
                            new Dish { Name = "Teriyaki Chicken Pizza", Price = 30m, CategoryId = pizzaCategory.Id, Description = "Fusion pizza topped with teriyaki chicken." },
                            new Dish { Name = "Sushi Roll Pizza", Price = 34m, CategoryId = pizzaCategory.Id, Description = "Pizza inspired by sushi flavors." },
                            new Dish { Name = "Ramen Pasta", Price = 28m, CategoryId = pastaCategory.Id, Description = "Spaghetti with Japanese ramen-style broth." },
                            new Dish { Name = "Miso Spaghetti", Price = 27m, CategoryId = pastaCategory.Id, Description = "Spaghetti with miso-based creamy sauce." },
                            new Dish { Name = "Sake Cocktail", Price = 15m, CategoryId = drinksCategory.Id, Description = "Refreshing cocktail made with Japanese sake." },
                            new Dish { Name = "Matcha Latte", Price = 12m, CategoryId = drinksCategory.Id, Description = "Green tea latte with steamed milk." },
                            new Dish { Name = "Plum Wine", Price = 14m, CategoryId = drinksCategory.Id, Description = "Traditional Japanese umeshu wine." },
                            new Dish { Name = "Sushi Soda", Price = 11m, CategoryId = drinksCategory.Id, Description = "Japanese soda with fruity flavor." },
                            new Dish { Name = "Gyoza Pizza", Price = 31m, CategoryId = pizzaCategory.Id, Description = "Pizza topped with gyoza dumplings." },
                            new Dish { Name = "Udon Carbonara", Price = 29m, CategoryId = pastaCategory.Id, Description = "Japanese udon noodles with Italian carbonara sauce." }
                        }
                    },

                    // 8. Paris Bistro
                    new Restaurant
                    {
                        Name = "Paris Bistro",
                        City = "Paris",
                        Street = "Rue de Rivoli",
                        Dishes = new List<Dish>
                        {
                            new Dish { Name = "French Onion Pasta", Price = 30m, CategoryId = pastaCategory.Id, Description = "Pasta inspired by French onion soup." },
                            new Dish { Name = "Escargot Pizza", Price = 35m, CategoryId = pizzaCategory.Id, Description = "Pizza topped with garlic snails." },
                            new Dish { Name = "Croissant Sandwich", Price = 20m, CategoryId = pastaCategory.Id, Description = "Flaky croissant filled with ham and cheese." },
                            new Dish { Name = "Champagne", Price = 40m, CategoryId = drinksCategory.Id, Description = "French sparkling wine." },
                            new Dish { Name = "Kir Royale", Price = 18m, CategoryId = drinksCategory.Id, Description = "Cocktail with crème de cassis and champagne." },
                            new Dish { Name = "Café au Lait", Price = 9m, CategoryId = drinksCategory.Id, Description = "French coffee with hot milk." },
                            new Dish { Name = "Quiche Lorraine", Price = 24m, CategoryId = pastaCategory.Id, Description = "Savory tart with bacon and cheese." },
                            new Dish { Name = "Crêpe Pizza", Price = 28m, CategoryId = pizzaCategory.Id, Description = "Thin crêpe topped like a pizza." },
                            new Dish { Name = "Baguette Bruschetta", Price = 19m, CategoryId = pizzaCategory.Id, Description = "Toasted baguette slices with toppings." },
                            new Dish { Name = "Macaron Shake", Price = 15m, CategoryId = drinksCategory.Id, Description = "Milkshake inspired by French macarons." }
                        }
                    },

                    // 9. Berlin Street Food
                    new Restaurant
                    {
                        Name = "Berlin Street Food",
                        City = "Berlin",
                        Street = "Alexanderplatz",
                        Dishes = new List<Dish>
                        {
                            new Dish { Name = "Currywurst Pizza", Price = 26m, CategoryId = pizzaCategory.Id, Description = "Pizza topped with German currywurst." },
                            new Dish { Name = "Döner Pasta", Price = 28m, CategoryId = pastaCategory.Id, Description = "Spaghetti with döner kebab meat." },
                            new Dish { Name = "Pretzel Bruschetta", Price = 20m, CategoryId = pizzaCategory.Id, Description = "German pretzel topped with bruschetta mix." },
                            new Dish { Name = "Berliner Beer", Price = 12m, CategoryId = drinksCategory.Id, Description = "Local Berlin craft beer." },
                            new Dish { Name = "Radler", Price = 10m, CategoryId = drinksCategory.Id, Description = "Beer mixed with lemonade." },
                            new Dish { Name = "Club-Mate", Price = 9m, CategoryId = drinksCategory.Id, Description = "German mate tea soft drink." },
                            new Dish { Name = "Schnitzel Pasta", Price = 29m, CategoryId = pastaCategory.Id, Description = "Pasta topped with crispy schnitzel strips." },
                            new Dish { Name = "Sauerkraut Pizza", Price = 24m, CategoryId = pizzaCategory.Id, Description = "Pizza topped with sauerkraut and sausage." },
                            new Dish { Name = "Jägermeister Shot", Price = 14m, CategoryId = drinksCategory.Id, Description = "German herbal liqueur." },
                            new Dish { Name = "Black Forest Shake", Price = 16m, CategoryId = drinksCategory.Id, Description = "Milkshake inspired by Black Forest cake." }
                        }
                    },
                    new Restaurant
                    {
                        Name = "Barcelona Tapas",
                        City = "Barcelona",
                        Street = "La Rambla",
                        Dishes = new List<Dish>
                        {
                            new Dish { Name = "Chorizo Pizza", Price = 27m, CategoryId = pizzaCategory.Id, Description = "Pizza topped with Spanish chorizo sausage." },
                            new Dish { Name = "Paella Pasta", Price = 33m, CategoryId = pastaCategory.Id, Description = "Pasta inspired by paella flavors with saffron and seafood." },
                            new Dish { Name = "Sangria", Price = 12m, CategoryId = drinksCategory.Id, Description = "Traditional Spanish drink made with wine and fresh fruits." },
                            new Dish { Name = "Seafood Pizza", Price = 30m, CategoryId = pizzaCategory.Id, Description = "Pizza with shrimp, mussels, and calamari." },
                            new Dish { Name = "Pasta Marinera", Price = 29m, CategoryId = pastaCategory.Id, Description = "Pasta served with a seafood mix and garlic sauce." },
                            new Dish { Name = "Horchata", Price = 9m, CategoryId = drinksCategory.Id, Description = "Sweet Spanish drink made from tiger nuts." },
                            new Dish { Name = "Ibérico Ham Pizza", Price = 32m, CategoryId = pizzaCategory.Id, Description = "Pizza topped with thin slices of Jamón Ibérico." },
                            new Dish { Name = "Pasta al Ajillo", Price = 26m, CategoryId = pastaCategory.Id, Description = "Pasta sautéed with garlic, chili, and olive oil." },
                            new Dish { Name = "Cava", Price = 15m, CategoryId = drinksCategory.Id, Description = "Spanish sparkling wine from Catalonia." },
                            new Dish { Name = "Patatas Bravas Pizza", Price = 28m, CategoryId = pizzaCategory.Id, Description = "Pizza topped with spicy potatoes and aioli." }
                        }
                    }

                };

                    context.AddRange(restaurants);
                }


                if (!await context.Role.AnyAsync())
                {
                    var roles = new List<Role>
                    {
                        new Role { Name = "User"},
                        new Role { Name = "Manager"},
                        new Role { Name = "Admin"},
                    };
                    context.AddRange(roles);
                    context.SaveChanges();
                }

                if (!await context.User.AnyAsync())
                {
                    var hasher = new PasswordHasher<User>();

                    var users = new List<User>
                {
                    new User { Email = "user@restaurant.com",   PasswordHash = hasher.HashPassword(null, "User123!"),    Role = "User"},
                    new User { Email = "manager@restaurant.com", PasswordHash = hasher.HashPassword(null, "Manager123!"),  Role = "Manager"},
                    new User { Email = "admin@restaurant.com",    PasswordHash = hasher.HashPassword(null, "Admin123!"),    Role = "Admin"},
                };

                    context.User.AddRange(users);
                    await context.SaveChangesAsync();
                }
            }
        }
    }
}
