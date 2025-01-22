type RouterList = { 
  name: string,
  key: string,
  path: string,
  children: RouterChildren[]
}

type RouterChildren = { name: string, key: string, path: string }

type User = {
  id: number | null;
  userName: string,
  nickName: string,
  roleType: number,
  roleTypeName: string,
  status: number
}

export { RouterList, User };
