using CleanRestaurantApi.Models;
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
        public async Task<ActionResult<IEnumerable<DishDto>>> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var dishes = await _dishService.GetAllAsync();
            return Ok(dishes);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateDishDto dto)
        {
            await _dishService.CreateAsync(dto);
            return Ok("Dish created succesfully");
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateDishDto dto)
        {
            await _dishService.UpdateAsync(id, dto);
            return Ok("Dish updated succesfully");
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdatePartially(int id, [FromBody] JsonPatchDocument<UpdateDishDto> patchDoc)
        {
            await _dishService.UpdatePartiallyAsync(id, patchDoc);
            return Ok("Dish updated succesfully");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _dishService.DeleteAsync(id);
            return Ok("Dish deleted succesfully");
        }
    }
}
