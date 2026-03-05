

type TListItemParams = {
    select: string[];
    expand: string;
    filter: string;
    orderby: string;
    top: number;
};

type TList = {
    Id: string;
    Title: string;
}



interface ISlides{
    Id: number;
    Title: string;
    FileLeafRef: string;
    FileRef: string;
    SlideOrder: number;
    BannerDescription: string;
    StartDate: string;
    EndDate: string;
    Status: string;
    Link: { Url: string; Description: string };
}





export { TList, TListItemParams, ISlides };
