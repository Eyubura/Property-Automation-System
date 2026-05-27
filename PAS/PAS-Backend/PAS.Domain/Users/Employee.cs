using Domain.Common;

namespace Domain.Users
{
    public class Employee : BaseEntity
    {
        public string EmployeeCode { get; private set; } = string.Empty;
        public string FullName     { get; private set; } = string.Empty;
        public string Department   { get; private set; } = string.Empty;
        public string? Position    { get; private set; }
        public string? Email       { get; set; }   // ← set instead of private set
        public string? Phone       { get; set; }   // ← set instead of private set
        public bool IsActive       { get; private set; } = true;

        private Employee() { }

        public Employee(string code, string name, string department)
        {
            EmployeeCode = code;
            FullName     = name;
            Department   = department;
        }

        public void UpdateContact(string? email, string? phone)
        {
            Email = email;
            Phone = phone;
        }

        public void Deactivate() => IsActive = false;
        public void Activate()   => IsActive = true;
    }
}