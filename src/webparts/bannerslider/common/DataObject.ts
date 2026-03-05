import { TListItemParams } from "./Types";

const listProperties: TListItemParams = { select: ['Id', 'Title'], expand: '', filter: 'BaseTemplate eq 101 and Hidden eq false', orderby: 'Title asc', top: 5000 };
const today = new Date().toISOString();
const listItemProperties: TListItemParams = {
    select: ['Id', 'Title','FileLeafRef','FileRef','SlideOrder','BannerDescription','StartDate','EndDate','Status','Link'],
    expand: '',
    filter: `Status eq'Active' and EndDate ge datetime'${today}'`,
    orderby: 'SlideOrder asc',
    top:15
};

export { listProperties, listItemProperties };
