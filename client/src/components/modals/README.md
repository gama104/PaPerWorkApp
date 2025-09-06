# Modal System Usage Guide

## Overview

The new modal system provides a consistent, maintainable way to handle modal dialogs throughout the application. It follows SOLID principles and clean code practices.

## Core Components

### BaseModal

The foundation component that provides consistent structure and behavior for all modals.

```typescript
import { BaseModal } from "../modals/BaseModal";

<BaseModal
  isOpen={isOpen}
  onClose={onClose}
  title="Modal Title"
  subtitle="Optional subtitle"
  headerConfig={{
    title: "Custom Header Title",
    showBackButton: true,
    onBack: handleBack,
  }}
  footerConfig={{
    buttons: [
      {
        label: "Save",
        variant: "primary",
        onClick: handleSave,
        loading: isSubmitting,
      },
      {
        label: "Cancel",
        variant: "secondary",
        onClick: handleCancel,
      },
    ],
  }}
  isLoading={loading}
  error={error}
  success={success}
>
  {/* Modal content */}
</BaseModal>;
```

### useModal Hook

Manages modal state and navigation with a state machine pattern.

```typescript
import { useModal } from "../../hooks/useModal";

const MyComponent = () => {
  const {
    state,
    actions,
    isOpen,
    isCertificationView,
    getCurrentCertificationId,
  } = useModal();

  // Open a certification view
  const handleViewCertification = (id: string) => {
    actions.openCertificationView(id);
  };

  // Navigate to edit mode
  const handleEdit = () => {
    if (isCertificationView) {
      const id = getCurrentCertificationId();
      if (id) actions.openCertificationEdit(id);
    }
  };

  return <div>{/* Your component content */}</div>;
};
```

### useForm Hook

Provides form state management with validation and submission handling.

```typescript
import { useForm } from "../../hooks/useForm";

const MyForm = () => {
  const { data, errors, isSubmitting, updateField, submit, hasUnsavedChanges } =
    useForm({
      name: "",
      email: "",
      age: 0,
    });

  const validationRules = {
    name: (value: string) =>
      value.length < 2 ? "Name must be at least 2 characters" : null,
    email: (value: string) => (!value.includes("@") ? "Invalid email" : null),
  };

  const handleSubmit = async () => {
    const success = await submit(async (formData) => {
      await api.saveData(formData);
    }, validationRules);

    if (success) {
      // Handle success
    }
  };

  return (
    <form>
      <input
        value={data.name}
        onChange={(e) => updateField("name", e.target.value)}
        className={errors.name ? "border-red-500" : ""}
      />
      {errors.name && <span className="text-red-500">{errors.name}</span>}

      <button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save"}
      </button>
    </form>
  );
};
```

### useApi Hook

Handles API calls with loading states and error handling.

```typescript
import { useApi } from "../../hooks/useApi";

const MyComponent = () => {
  const { loading, error, success, execute } = useApi();

  const handleSave = async () => {
    await execute(() => api.saveData(data), {
      successMessage: "Data saved successfully!",
      onSuccess: (result) => {
        console.log("Saved:", result);
      },
      onError: (error) => {
        console.error("Save failed:", error);
      },
    });
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
      <button onClick={handleSave} disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
};
```

## Modal State Machine

The modal system uses a state machine pattern with these states:

- `closed` - No modal open
- `certification-view` - Viewing certification details
- `certification-edit` - Editing certification
- `session-list` - Viewing sessions for a certification
- `session-view` - Viewing session details
- `session-edit` - Editing session
- `session-create` - Creating new session

## Navigation Flow

```
Certifications List
    ↓ (click item)
Certification View Modal
    ├── Edit → Certification Edit Form
    ├── View Sessions → Session List Modal
    └── Download PDF
            ↓ (click item)
        Session View Modal
            ├── Edit → Session Edit Form
            └── Back → Session List Modal
```

## Best Practices

1. **Always use the BaseModal** for consistent styling and behavior
2. **Use the useModal hook** for state management
3. **Use the useForm hook** for form handling
4. **Use the useApi hook** for API calls
5. **Follow the state machine pattern** for navigation
6. **Handle loading and error states** consistently
7. **Provide clear user feedback** with success/error messages
8. **Use TypeScript** for type safety
9. **Keep components focused** on a single responsibility
10. **Test thoroughly** with different modal states

