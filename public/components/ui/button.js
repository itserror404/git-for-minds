// Button component inspired by shadcn/ui
class Button {
    static variants = {
        default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
        destructive: "bg-red-500 text-slate-50 hover:bg-red-500/90",
        outline: "border border-slate-200 bg-white hover:bg-slate-100 hover:text-slate-900",
        secondary: "bg-slate-100 text-slate-900 hover:bg-slate-100/80",
        ghost: "hover:bg-slate-100 hover:text-slate-900",
        link: "text-slate-900 underline-offset-4 hover:underline"
    };

    static sizes = {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10"
    };

    static create(options = {}) {
        const {
            variant = 'default',
            size = 'default',
            className = '',
            children = '',
            onClick = null,
            disabled = false,
            ...props
        } = options;

        const button = document.createElement('button');
        
        // Base classes
        const baseClasses = [
            'inline-flex', 'items-center', 'justify-center', 'gap-2',
            'whitespace-nowrap', 'rounded-md', 'text-sm', 'font-medium',
            'ring-offset-white', 'transition-colors',
            'focus-visible:outline-none', 'focus-visible:ring-2',
            'focus-visible:ring-slate-950', 'focus-visible:ring-offset-2',
            'disabled:pointer-events-none', 'disabled:opacity-50'
        ];

        // Combine all classes
        const allClasses = [
            ...baseClasses,
            ...this.variants[variant].split(' '),
            ...this.sizes[size].split(' '),
            ...className.split(' ')
        ].filter(Boolean);

        button.className = allClasses.join(' ');
        button.innerHTML = children;
        button.disabled = disabled;

        if (onClick) {
            button.addEventListener('click', onClick);
        }

        // Add any additional properties
        Object.entries(props).forEach(([key, value]) => {
            button.setAttribute(key, value);
        });

        return button;
    }
} 