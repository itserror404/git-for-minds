// Card components inspired by shadcn/ui
class Card {
    static create(options = {}) {
        const { className = '', children = '', ...props } = options;
        
        const card = document.createElement('div');
        card.className = `rounded-lg border bg-white text-slate-950 shadow-sm ${className}`;
        
        if (typeof children === 'string') {
            card.innerHTML = children;
        } else if (children instanceof HTMLElement) {
            card.appendChild(children);
        }
        
        Object.entries(props).forEach(([key, value]) => {
            card.setAttribute(key, value);
        });
        
        return card;
    }
}

class CardHeader {
    static create(options = {}) {
        const { className = '', children = '', ...props } = options;
        
        const header = document.createElement('div');
        header.className = `flex flex-col space-y-1.5 p-6 ${className}`;
        
        if (typeof children === 'string') {
            header.innerHTML = children;
        } else if (children instanceof HTMLElement) {
            header.appendChild(children);
        }
        
        return header;
    }
}

class CardTitle {
    static create(options = {}) {
        const { className = '', children = '', ...props } = options;
        
        const title = document.createElement('h3');
        title.className = `text-2xl font-semibold leading-none tracking-tight ${className}`;
        
        if (typeof children === 'string') {
            title.innerHTML = children;
        } else if (children instanceof HTMLElement) {
            title.appendChild(children);
        }
        
        return title;
    }
}

class CardContent {
    static create(options = {}) {
        const { className = '', children = '', ...props } = options;
        
        const content = document.createElement('div');
        content.className = `p-6 pt-0 ${className}`;
        
        if (typeof children === 'string') {
            content.innerHTML = children;
        } else if (children instanceof HTMLElement) {
            content.appendChild(children);
        }
        
        return content;
    }
} 