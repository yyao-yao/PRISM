export interface BasePageConfig {
    type: 'about' | 'publication' | 'card' | 'text';
    title: string;
    description?: string;
}

export interface PublicationPageConfig extends BasePageConfig {
    type: 'publication';
    source: string;
    research?: {
        publications_title: string;
        categories: Array<{ id: string; title: string }>;
        citations: Array<{ id: string; text: string }>;
        sections: Array<{
            id: string;
            title: string;
            items: Array<{ title: string; author?: string; details: string; recognition?: string }>;
        }>;
    };
}

export interface TextPageConfig extends BasePageConfig {
    type: 'text';
    source: string;
}

export interface CardItem {
    title: string;
    subtitle?: string;
    date?: string;
    content?: string;
    tags?: string[];
    link?: string;
    image?: string;
}

export interface CardPageConfig extends BasePageConfig {
    type: 'card';
    items: CardItem[];
    teaching?: Array<{
        id: string;
        title: string;
        items: Array<{
            title: string;
            institution: string;
            role: string;
            semester: string;
            level?: string;
            recognition?: string;
            recognition_institution?: string;
            courses_label?: string;
            courses?: string[];
        }>;
    }>;
}
