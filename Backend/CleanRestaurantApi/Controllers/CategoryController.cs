using CleanRestaurantApi.Models;
using CleanRestaurantApi.Models.Auth;
using CleanRestaurantApi.Services;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;

namespace CleanRestaurantApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetById(int id)
        {
            var category = await _categoryService.GetByIdAsync(id);
            return Ok(category);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetAll()
        {
            var category = await _categoryService.GetAllAsync();
            return Ok(category);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] CreateCategoryDto dto)
        {
            await _categoryService.CreateAsync(dto);
            return Ok(new MessageResponseDto{ Message = "Category created successfully"});
        }

        [HttpPatch("{id}")]
        public async Task<ActionResult> Update(int id, [FromBody] JsonPatchDocument<UpdateCategoryDto> patchDoc)
        {
            await _categoryService.UpdateAsync(id, patchDoc);
            return Ok(new MessageResponseDto { Message = "Category updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            await _categoryService.DeleteAsync(id);
            return Ok(new MessageResponseDto { Message = "Category deleted successfully" });
        }
    }
}
