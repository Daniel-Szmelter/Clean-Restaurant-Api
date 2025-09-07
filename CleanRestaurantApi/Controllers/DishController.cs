using CleanRestaurantApi.Models;
using CleanRestaurantApi.Models.Auth;
using CleanRestaurantApi.Services;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;

namespace CleanRestaurantApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DishController : ControllerBase
    {
        private readonly IDishService _dishService;

        public DishController(IDishService dishService)
        {
            _dishService = dishService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DishDto>> GetById(int id)
        {
            var dish = await _dishService.GetByIdAsync(id);
            return Ok(dish);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DishDto>>> GetAll()
        {
            var dishes = await _dishService.GetAllAsync();
            return Ok(dishes);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateDishDto dto)
        {
            await _dishService.CreateAsync(dto);
            return Ok(new MessageResponseDto { Message = "Dish created succesfully" });
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult> UpdatePartially(int id, [FromBody] JsonPatchDocument<UpdateDishDto> patchDoc)
        {
            await _dishService.UpdateAsync(id, patchDoc);
            return Ok(new MessageResponseDto { Message = "Dish updated succesfully" });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _dishService.DeleteAsync(id);
            return Ok(new MessageResponseDto { Message = "Dish deleted succesfully" });
        }
    }
}
