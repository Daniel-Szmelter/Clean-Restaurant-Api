using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;
using CleanRestaurantApi.Services;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CleanRestaurantApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RestaurantController : ControllerBase
    {
        private readonly IRestaurantService _restaurantService;

        public RestaurantController(IRestaurantService restaurantService)
        {
            _restaurantService = restaurantService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Restaurant>> GetById(int id)
        {
            var restaurant = await _restaurantService.GetByIdAsync(id);
            return Ok(restaurant);
        }

        [HttpGet]
        public async Task<ActionResult<Restaurant>> GetAll()
        {
            var restaurants = await _restaurantService.GetAllAsync();
            return Ok(restaurants);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateRestaurantDto dto)
        {
            var restaurantId = await _restaurantService.CreateAsync(dto);
            return Ok(new { id = restaurantId });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateRestaurantDto dto)
        {
            await _restaurantService.UpdateAsync(id, dto);
            return Ok("Restaurant updated succesfully");
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdatePartially(int id, [FromBody] JsonPatchDocument<UpdateRestaurantDto> patchDoc)
        {
            await _restaurantService.UpdatePartiallyAsync(id, patchDoc);
            return Ok();
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _restaurantService.DeleteAsync(id);
            return Ok("Restaurant deleted succesfully");
        }
    }
}
