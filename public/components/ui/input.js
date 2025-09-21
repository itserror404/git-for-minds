// Input component inspired by shadcn/ui
class Input {
    static create(options = {}) {
        const {
            type = 'text',
            className = '',
            placeholder = '',
            value = '',
            disabled = false,
            ...props
        } = options;

        const input = document.createElement('input');
        
        const baseClasses = [
            'flex', 'h-10', 'w-full', 'rounded-md', 'border',
            'border-slate-200', 'bg-white', 'px-3', 'py-2',
            'text-sm', 'ring-offset-white',
            'file:border-0', 'file:bg-transparent', 'file:text-sm', 'file:font-medium',
            'placeholder:text-slate-500',
            'focus-visible:outline-none', 'focus-visible:ring-2',
            'focus-visible:ring-slate-950', 'focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed', 'disabled:opacity-50'
        ];

        const allClasses = [...baseClasses, ...className.split(' ')].filter(Boolean);
        
        input.type = type;
        input.className = allClasses.join(' ');
        input.placeholder = placeholder;
        input.value = value;
        input.disabled = disabled;

        Object.entries(props).forEach(([key, value]) => {
            input.setAttribute(key, value);
        });

        return input;
    }
}

class Textarea {
    static create(options = {}) {
        const {
            className = '',
            placeholder = '',
            value = '',
            rows = 3,
            disabled = false,
            ...props
        } = options;

        const textarea = document.createElement('textarea');
        
        const baseClasses = [
            'flex', 'min-h-[80px]', 'w-full', 'rounded-md', 'border',
            'border-slate-200', 'bg-white', 'px-3', 'py-2',
            'text-sm', 'ring-offset-white',
            'placeholder:text-slate-500',
            'focus-visible:outline-none', 'focus-visible:ring-2',
            'focus-visible:ring-slate-950', 'focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed', 'disabled:opacity-50'
        ];

        const allClasses = [...baseClasses, ...className.split(' ')].filter(Boolean);
        
        textarea.className = allClasses.join(' ');
        textarea.placeholder = placeholder;
        textarea.value = value;
        textarea.rows = rows;
        textarea.disabled = disabled;

        Object.entries(props).forEach(([key, value]) => {
            textarea.setAttribute(key, value);
        });

        return textarea;
    }
} 