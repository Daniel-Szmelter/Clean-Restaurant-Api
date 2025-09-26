using CleanRestaurantApi.Entities;
using CleanRestaurantApi.Models;
using CleanRestaurantApi.Models.Auth;
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
        public async Task<ActionResult<RestaurantDto>> GetById(int id)
        {
            var restaurant = await _restaurantService.GetByIdAsync(id);
            return Ok(restaurant);
        }

        [HttpGet]
        public async Task<ActionResult<RestaurantDto>> GetAll()
        {
            var restaurants = await _restaurantService.GetAllAsync();
            return Ok(restaurants);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateRestaurantDto dto)
        {
            var restaurantId = await _restaurantService.CreateAsync(dto);
            return Ok(new { id = restaurantId, Message = "Restaurant created succesfully" });
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] JsonPatchDocument<UpdateRestaurantDto> patchDoc)
        {
            await _restaurantService.UpdateAsync(id, patchDoc);
            return Ok(new MessageResponseDto { Message = "Restaurant updated succesfully" });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _restaurantService.DeleteAsync(id);
            return Ok(new MessageResponseDto { Message = "Restaurant deleted succesfully" });
        }
    }
}
