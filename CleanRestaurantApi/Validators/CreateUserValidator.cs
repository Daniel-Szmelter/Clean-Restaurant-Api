using CleanRestaurantApi.Models;
using CleanRestaurantAPI.Data;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CleanRestaurantApi.Validators
{
    public class CreateUserValidator : AbstractValidator<CreateUserDto>
    {
        public CreateUserValidator(AppDbContext context)
        {

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid email format");

            RuleFor(x => x.Email)
                .Custom((value, validationContext) =>
                {
                    var emailInUse = context.User.Any(u => u.Email == value);
                    if (emailInUse)
                    {
                        validationContext.AddFailure("Email", "That email is taken");
                    }
                });

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters");

            RuleFor(x => x.ConfirmPassword)
                .Equal(e => e.Password).WithMessage("Password must be equal to confirmed password");
        }
    }
}
