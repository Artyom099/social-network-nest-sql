import {Injectable} from "@nestjs/common";
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {BannedUsersPaginationInput} from "../../../infrastructure/utils/common.models";
import {PagingViewModel} from "../../../infrastructure/types/paging.view.model";
import {BannedUserForBlogViewModel} from "../api/models/banned.user.for.blog.view.model";

@Injectable()
export class BannedUsersForBlogQueryRepository {
    constructor(
        @InjectDataSource() private dataSource: DataSource,
    ) {}

    async getBannedUsersCurrentBlog(
        blogId: string,
        query: BannedUsersPaginationInput,
    ): Promise<PagingViewModel<BannedUserForBlogViewModel[]>> {
        const totalCount = await this.dataSource.query(`
        select count(*)
        from "BannedUsersForBlog"
        where "IsBanned" = true and "BlogId" = $1
        `, [blogId])

        const sortedUsers = await this.dataSource.query(`
        select "UserId" as "id", "Login" as "login", "BlogId" as "blogId", "IsBanned" as "isBanned", "BanDate" as "banDate", "BanReason" as "banReason"
        from "BannedUsersForBlog"
        where "IsBanned" = true and "BlogId" = $1
        order by $2 $3
        limit $4 
        offset $5
        `, [blogId, query.sortBy, query.sortDirection, query.pageSize, query.skip()])

        const items = sortedUsers.map((u) => {
            return {
                id: u.id,
                login: u.login,
                banInfo: {
                    isBanned: u.isBanned,
                    banDate: u.banDate ? u.banDate.toISOString() : null,
                    banReason: u.banReason,
                },
            };
        });

        return {
            pagesCount: query.pagesCount(totalCount), // общее количество страниц
            page: query.pageNumber, // текущая страница
            pageSize: query.pageSize, // количество пользователей на странице
            totalCount, // общее количество пользователей
            items,
        };
    }
}