using CleanRestaurantApi.Models;
using FluentValidation;

namespace CleanRestaurantApi.Validators
{
    public class CreateRestaurantValidator : AbstractValidator<CreateRestaurantDto>
    {
        public CreateRestaurantValidator()
        {
            RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.City).NotEmpty().MaximumLength(50);
            RuleFor(x => x.Street).NotEmpty().MaximumLength(100);
        }
    }
}
