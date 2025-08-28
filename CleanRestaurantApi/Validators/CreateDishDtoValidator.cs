using CleanRestaurantApi.Models;
using FluentValidation;

namespace CleanRestaurantApi.Validators
{
    public class CreateDishDtoValidator : AbstractValidator<CreateDishDto>
    {
        public CreateDishDtoValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty().WithMessage("Dish name is required")
                .MaximumLength(100);

            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Price must be greater than 0");
        }
    }
}
