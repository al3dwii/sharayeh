import { Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableRow, TableHead, TableBody, TableCell, Badge } from "@/components/ui"

interface UserFile {
  id: string
  fileName: string
  status: 'Active' | 'Pending' | 'Inactive'
  createdAt: Date
}

interface FilesCardProps {
  userFiles: UserFile[]
}

export function FilesCard({ userFiles }: FilesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Files</CardTitle>
      </CardHeader>
      <CardContent>
        {userFiles.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded On</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell>{file.fileName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        file.status === 'Active'
                          ? 'success'
                          : file.status === 'Pending'
                          ? 'warning'
                          : 'default'
                      }
                    >
                      {file.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(file.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No files uploaded by this user.</p>
        )}
      </CardContent>
    </Card>
  )
}

